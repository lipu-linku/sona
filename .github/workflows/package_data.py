import json
import re
import tomllib
from collections import defaultdict
from pathlib import Path
from typing import Any, Callable, Final, TypedDict

DATA_FOLDER: Final[str] = "metadata"
TRANSLATIONS_FOLDER: Final[str] = "translations"
CURRENT_API_VERSION = "v2"

Transformer = Callable[[str, str, str], None]


class DataPendingTransform(TypedDict):
    input: str
    output: str
    transformer: Transformer


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


def write_json(path: Path, data: dict[str, Any]):
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
        # print(file)
        path_str = str(file).replace("\\", "/")
        m = input_pattern.match(path_str)
        if not m:
            print(f"Path {path_str} does not match input pattern {input_pattern}")
            continue
        params = m.groupdict()

        group_key = tuple(params[var] for var in output_vars)
        key = params[key_var]

        with file.open("rb") as f:
            data[group_key][key] = tomllib.load(f)
            # we intend to copy the item's id to the id key
            # not all files are set up this way at present...
            # TODO:
            if key != data[group_key][key]["id"]:
                print(f"key-id mismatch in {file}")

    return data


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
        paths = tuple(params[var] for var in output_vars)
        # 'commentary', 'definition', etc
        keys = {k: v for k, v in params.items() if k not in output_vars}
        if len(keys) != 1:
            raise ValueError(f"Expected exactly one type of locale string, got {keys}")

        key = make_singular(next(iter(keys.values())))
        with file.open("rb") as f:
            local_data = tomllib.load(f)
            # 'a': 'emphasis particle' or whatever
            for object_id, locale_string in local_data.items():
                data[paths][object_id][key] = locale_string

    return data


def package_locales(root: str, input: str, output: str):
    output_vars = re.findall(r"{(\w+)}", output)
    data = fetch_locales(input, output)

    for paths, locale_data in data.items():
        params = dict(zip(output_vars, paths))
        output_path = Path(root) / substitute_params(output, params)
        write_json(output_path, locale_data)

    for paths, data in data.items():
        params = dict(zip(output_vars, paths))
        output_path = Path(root) / substitute_params(output, params)
        write_json(output_path, data)


DATA: dict[str, DataPendingTransform] = {
    "words": {
        "input": "words/metadata/{id}.toml",
        "output": "words.json",
        "transformer": package_data,
    },
    "glyphs": {
        "input": "glyphs/metadata/{id}.toml",
        "output": "glyphs.json",
        "transformer": package_data,
    },
    "sandbox_words": {
        "input": "sandbox/words/metadata/{id}.toml",
        "output": "sandbox/words.json",
        "transformer": package_data,
    },
    "sandbox_glyphs": {
        "input": "sandbox/glyphs/metadata/{id}.toml",
        "output": "sandbox/glyphs.json",
        "transformer": package_data,
    },
    "lp_signs": {
        "input": "luka_pona/signs/metadata/{id}.toml",
        "output": "luka_pona/signs.json",
        "transformer": package_data,
    },
    "lp_fingerspelling": {
        "input": "luka_pona/fingerspelling/metadata/{id}.toml",
        "output": "luka_pona/fingerspelling.json",
        "transformer": package_data,
    },
    "fonts": {
        "input": "fonts/metadata/{id}.toml",
        "output": "fonts.json",
        "transformer": package_data,
    },
    "languages": {
        "input": "languages/metadata/{id}.toml",
        "output": "languages.json",
        "transformer": package_data,
    },
    ###
    ###
    ###
    "words_locale": {
        "input": "words/translations/{langcode}/{id}.toml",
        "output": "translations/{langcode}/words.json",
        "transformer": package_locales,
    },
    "glyphs_locale": {
        "input": "glyphs/translations/{langcode}/{id}.toml",
        "output": "translations/{langcode}/glyphs.json",
        "transformer": package_locales,
    },
    "sandbox_words_locale": {
        "input": "sandbox/words/translations/{langcode}/{id}.toml",
        "output": "sandbox/translations/{langcode}/words.json",
        "transformer": package_locales,
    },
    "sandbox_glyphs_locale": {
        "input": "sandbox/glyphs/translations/{langcode}/{id}.toml",
        "output": "sandbox/translations/{langcode}/glyphs.json",
        "transformer": package_locales,
    },
    "lp_signs_locale": {
        "input": "luka_pona/signs/translations/{langcode}/{id}.toml",
        "output": "luka_pona/translations/{langcode}/signs.json",
        "transformer": package_locales,
    },
    "lp_fingerspelling_locale": {
        "input": "luka_pona/fingerspelling/translations/{langcode}/{id}.toml",
        "output": "luka_pona/translations/{langcode}/fingerspelling.json",
        "transformer": package_locales,
    },
}


def main():
    for id, metadata in DATA.items():
        input = metadata["input"]
        output = metadata["output"]
        transformer = metadata["transformer"]
        transformer(f"api/raw/{CURRENT_API_VERSION}/", input, output)

    print("Done!")


if __name__ == "__main__":
    main()
