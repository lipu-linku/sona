import json
import re
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import tomlkit
from tomlkit import TOMLDocument

TOML_CACHE: dict[Path, TOMLDocument] = {}
LANG_DIR = Path("languages/metadata")


def load_languages() -> dict[str, Any]:
    known_langs = {}
    for file in LANG_DIR.glob("*.toml"):
        with file.open("r", encoding="utf-8") as f:
            data = tomlkit.loads(f.read())
            lang_id = data["id"]
            assert lang_id == file.stem, f"Lang {file.name} has wrong lang_id {lang_id}"
            known_langs[lang_id] = data
    return known_langs


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


def cached_toml_read(file: Path):
    # don't cached read if the file doesn't exist
    if not file.exists():
        return None

    if file in TOML_CACHE:
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
    path.write_text(raw_data)


def write_toml(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    sorted_items = [(key, data[key]) for key in sorted(data.keys())]
    data.clear()
    for key, value in sorted_items:
        data.add(key, value)

    raw = tomlkit.dumps(data)
    if raw.startswith("\n"):
        raw = raw.lstrip("\n")
    path.write_text(raw, encoding="utf-8")


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
