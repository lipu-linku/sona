import json
import os
import re
import sys
import tomllib
from collections import defaultdict
from pathlib import Path

# this lets you import from files in the same dir
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import CURRENT_API_VERSION, DATA


def make_singular(word: str) -> str:
    # NOTE: generalize this implementation later if needed
    if word == "definitions":
        word = "definition"
    return word


def glob_to_regex(glob_pattern: str) -> re.Pattern[str]:
    regex = re.escape(glob_pattern)
    regex = regex.replace(r"\{", "{").replace(r"\}", "}")
    regex = re.sub(r"{(\w+)}", r"(?P<\1>[^/]+)", regex)
    return re.compile("^" + regex + "$")


def substitute_params(template: str, params: dict[str, str]) -> str:
    return template.format(**params)


def find_files(glob_pattern: str):
    glob_path = re.sub(r"{\w+}", "*", glob_pattern)
    return Path().glob(glob_path)


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    raw_data = json.dumps(
        data,
        separators=(",", ":"),
        ensure_ascii=False,
        sort_keys=True,
        allow_nan=False,
    )
    path.write_text(raw_data)


def get_unbound_param(input: str, output: str) -> str:
    """
    Between input and output, there should be exactly one filename variable
    which is not already bound (i.e., which is in input but not output).
    That will become the top level key of a new object.
    """
    input_vars: list[str] = re.findall(r"{(\w+)}", input)
    output_vars: list[str] = re.findall(r"{(\w+)}", output)

    remaining: set[str] = set(input_vars) - set(output_vars)
    if len(remaining) != 1:
        raise ValueError(
            f"Expected exactly one param in {input} not in {output}, got {remaining}"
        )
    key_var = remaining.pop()
    return key_var


def get_bound_param(input: str, output: str) -> str:
    input_vars: list[str] = re.findall(r"{(\w+)}", input)
    output_vars: list[str] = re.findall(r"{(\w+)}", output)

    remaining: set[str] = set(input_vars) & set(output_vars)
    if len(remaining) != 1:
        raise ValueError(
            f"Expected exactly one param in {input} not in {output}, got {remaining}"
        )
    key_var = remaining.pop()
    return key_var


def get_path_values(input: str, path: str):
    input_pattern = glob_to_regex(input)
    m = input_pattern.match(path)
    if not m:
        raise ValueError(f"Path {path} does not match input pattern {input_pattern}")
    return m.groupdict()


def fetch_data(input: str, output: str, log: bool = False) -> dict[str, dict]:
    key_param = get_unbound_param(input, output)
    data = defaultdict(lambda: defaultdict(defaultdict))
    for file in find_files(input):
        if log:
            print(file)

        values = get_path_values(input, str(file))
        label = values.pop(key_param)
        with file.open("rb") as f:
            data[label] = tomllib.load(f)

    return dict(data)


def package_data(root: str, input: str, output: str):
    data = fetch_data(input, output, log=True)
    output_path = Path(root) / Path(output)
    # no top level key, so just write the data
    write_json(output_path, data)


def fetch_locales(input: str, output: str, log: bool = False) -> dict[str, dict]:
    key_param = get_unbound_param(input, output)  # should be id
    data = defaultdict(lambda: defaultdict(defaultdict))
    for file in find_files(input):
        if log:
            print(file)

        values = get_path_values(input, str(file))
        label = values.pop(key_param)
        group = next(iter(values.values()))  # type of locale str
        label = make_singular(label)

        with file.open("rb") as f:
            local_data = tomllib.load(f)  # each translation file
            for object_id, locale_string in local_data.items():
                data[group][object_id][label] = locale_string

    return dict(data)


def package_locales(root: str, input: str, output: str):
    data = fetch_locales(input, output, log=True)
    param = get_bound_param(input, output)
    for group, local_data in data.items():
        output_path = Path(root) / substitute_params(output, {param: group})
        write_json(output_path, local_data)


FETCH_MAP = {"data": fetch_data, "locales": fetch_locales}
PACKAGE_MAP = {"data": package_data, "locales": package_locales}


def main():
    for id, metadata in DATA.items():
        input = metadata["input"]
        output = metadata["output"]
        typ = metadata["type"]
        packager = PACKAGE_MAP[typ]
        packager(f"api/raw/{CURRENT_API_VERSION}/", input, output)

    print("Done!")


if __name__ == "__main__":
    main()
