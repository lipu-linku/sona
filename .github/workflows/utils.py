import json
import os
import re
import sys
from collections import defaultdict
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import tomlkit
import tomlkit.exceptions
from tomlkit import TOMLDocument

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA, LANG_DIR

TOML_CACHE: dict[Path, TOMLDocument] = {}


def load_languages() -> dict[str, Any]:
    known_langs = {}
    for file in LANG_DIR.glob("*.toml"):
        with file.open("r", encoding="utf-8") as f:
            data = tomlkit.loads(f.read())
            lang_id = data["id"]
            assert lang_id == file.stem, f"Lang {file.name} has wrong lang_id {lang_id}"
            known_langs[lang_id] = data
    return known_langs


def load_data():
    data = dict()
    for key, config in DATA.items():
        input = config["input"]
        output = config["output"]
        typ = config["type"]
        fetcher = FETCH_MAP[typ]
        try:
            data[key] = fetcher(input, output)
        except tomlkit.exceptions.TOMLKitError as e:
            print(f"TOMLKitError when packing {input} to {output} with {typ} formatter")
            # print(f"... Schema: {config.get('schema')} ")
            print(f"... {json.dumps(config, indent=2)}")
            print(f"... {e} {e.__dict__}")
    return data


def glob_to_regex(glob_pattern: str) -> re.Pattern[str]:
    regex = re.escape(glob_pattern)
    regex = regex.replace(r"\{", "{").replace(r"\}", "}")
    regex = re.sub(r"{(\w+)}", r"(?P<\1>[^/]+)", regex)
    return re.compile("^" + regex + "$")


def substitute_params(template: str, params: dict[str, str]) -> str:
    return template.format(**params)


def find_files(glob_pattern: str) -> Iterator[Path]:
    glob_path = re.sub(r"{\w+}", "*", glob_pattern)
    return Path().glob(glob_path)


def cached_toml_read(file: Path, force: bool = False):
    # don't cached read if the file doesn't exist
    if not file.exists():
        return None

    if file in TOML_CACHE and not force:
        return TOML_CACHE[file]
    with open(file, "r", encoding="utf-8") as f:
        data = tomlkit.parse(f.read())
    TOML_CACHE[file] = data
    return data


def write_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    raw_data = json.dumps(
        data,
        separators=(",", ":"),
        ensure_ascii=False,
        sort_keys=True,
        allow_nan=False,
    )
    return path.write_text(raw_data)


def write_toml(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    sorted_items = [(key, data[key]) for key in sorted(data.keys())]
    data.clear()
    for key, value in sorted_items:
        data.add(key, value)

    raw = tomlkit.dumps(data)
    if raw.startswith("\n"):
        raw = raw.lstrip("\n")
    return path.write_text(raw, encoding="utf-8")


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


def deep_merge(parent: dict, child: dict, overwrite_empty: bool = False):
    """Merge the keys of a child dictionary into a parent dictionary.
    Does not overwrite existing keys on the parent."""
    for key in child:
        if key not in parent:
            parent[key] = child[key]
            continue
        if overwrite_empty and not parent[key]:
            parent[key] = child[key]
            continue
        if isinstance(parent[key], dict) and isinstance(child[key], dict):
            deep_merge(parent[key], child[key])


def has_same_keys(d1: dict, d2: dict):
    d1keys = set(d1.keys())
    d2keys = set(d2.keys())

    return d1keys == d2keys


def remove_orphaned_keys(translation: dict, source: dict, path=""):
    warnings = []
    keys_to_remove = [key for key in translation if key not in source]

    for key in keys_to_remove:
        print(f"Key '{path + key}' in translation but not source; removing.")
        del translation[key]

    for key in list(translation.keys()):
        if (
            key in source
            and isinstance(translation[key], dict)
            and isinstance(source[key], dict)
        ):
            sub_warnings = remove_orphaned_keys(
                translation[key], source[key], path + key + "."
            )
            warnings.extend(sub_warnings)

    return warnings


def fetch_data(input: str, output: str, log: bool = False) -> dict[str, dict]:
    key_param = get_unbound_param(input, output)
    data = defaultdict(lambda: defaultdict(defaultdict))
    for file in find_files(input):
        if log:
            print(file)

        values = get_path_values(input, str(file))
        label = values.pop(key_param)
        local_data = cached_toml_read(file)
        if not local_data:
            print(f"Data file {file} was missing!")
            continue
        data[label] = local_data

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

        # each translation file
        local_data = cached_toml_read(file)
        if not local_data:
            print(f"Locale file {file} was missing!")
            continue

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
