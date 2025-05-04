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

from constants import CURRENT_API_VERSION, DATA, Packager


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


def fetch_data(input: str, output: str) -> dict[str, dict]:
    input_pattern = glob_to_regex(input)
    input_vars: list[str] = re.findall(r"{(\w+)}", input)
    output_vars: list[str] = re.findall(r"{(\w+)}", output)

    remaining: set[str] = set(input_vars) - set(output_vars)
    if len(remaining) != 1:
        raise ValueError(
            f"Expected exactly one param in {input} and not in {output}, got {remaining}"
        )
    key_var = remaining.pop()

    data = defaultdict(lambda: defaultdict(defaultdict))
    for file in find_files(input):
        print(file)
        path_str = str(file).replace("\\", "/")
        m = input_pattern.match(path_str)
        if not m:
            print(f"Path {path_str} does not match input pattern {input_pattern}")
            continue
        params = m.groupdict()
        key = params[key_var]
        # TODO: what if there are more intermediate layers?

        with file.open("rb") as f:
            data[key] = tomllib.load(f)
            # we intend to copy the item's id to the id key
            # not all files are set up this way at present...
            # TODO:
            if key != data[key]["id"]:
                print(f"key-id mismatch in {file}")

    return dict(data)


def package_data(root: str, input: str, output: str):
    output_vars = re.findall(r"{(\w+)}", output)
    data = fetch_data(input, output)

    for group_key, group_data in data.items():
        params = dict(zip(output_vars, group_key))
        output_path = Path(root) / substitute_params(output, params)
        write_json(output_path, group_data)


def fetch_locales(input: str, output: str) -> dict[str, dict]:
    input_pattern = glob_to_regex(input)
    output_vars = re.findall(r"{(\w+)}", output)

    data = defaultdict(lambda: defaultdict(defaultdict))

    for file in find_files(input):
        # print(file)
        path_str = str(file).replace("\\", "/")
        m = input_pattern.match(path_str)
        if not m:
            continue
        params = m.groupdict()

        # expected to be one langcode per file right now
        groups = tuple(params[var] for var in output_vars)
        if len(groups) != 1:
            raise ValueError(f"Expected exactly one locale data group, got {groups}")
        group = next(iter(groups))
        # TODO: what if there are more intermediate layers?

        # 'commentary', 'definition', etc
        keys = {k: v for k, v in params.items() if k not in output_vars}
        if len(keys) != 1:
            raise ValueError(f"Expected exactly one type of locale string, got {keys}")
        key = make_singular(next(iter(keys.values())))

        with file.open("rb") as f:
            local_data = tomllib.load(f)
            # 'a': 'emphasis particle' or whatever
            for object_id, locale_string in local_data.items():
                data[group][object_id][key] = locale_string

    return dict(data)


def package_locales(root: str, input: str, output: str):
    output_vars = re.findall(r"{(\w+)}", output)
    data = fetch_locales(input, output)

    for paths, locale_data in data.items():
        params = dict(zip(output_vars, paths))
        output_path = Path(root) / substitute_params(output, params)
        write_json(output_path, locale_data)


FETCH_MAP = {"data": fetch_data, "locales": fetch_locales}
PACKAGE_MAP: dict[str, Packager] = {"data": package_data, "locales": package_locales}


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
