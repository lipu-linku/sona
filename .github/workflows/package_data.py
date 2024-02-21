import json
from pathlib import Path
from typing import Any, Callable, Final, Iterator, Optional

import tomlkit

DATA_FOLDER: Final[str] = "metadata"
TRANSLATIONS_FOLDER: Final[str] = "translations"


# TODO: rename file in repo and crowdin later?
# or fetch stem a more robust way
def fetch_words_stem(path: Path, data: dict):
    stem = path.stem
    if stem == "definitions":
        stem = "definition"
    return stem


# Value is a function that produces the parent key, if any
DATA_TYPES: Final[dict[str, Callable[[Path, dict], Optional[str]]]] = {
    "words": lambda path, data: fetch_words_stem(path, data),
    "luka_pona/signs": lambda path, data: path.stem,
    "luka_pona/fingerspelling": lambda path, data: path.stem,
    "fonts": lambda path, data: path.stem,
    "languages": lambda path, data: None,
}


def extract_data(
    result: dict[str, Any],
    paths: Iterator[Path],
    key_maker: Callable[[Path, dict], Optional[str]],
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            data = tomlkit.load(file)
            key = key_maker(path, data)

            if key:
                result[key] = data
                # we assume the key is unique
            else:
                result.update(data)
                # we assume all keys in data are unique


def insert_translations(
    result: dict[str, Any],
    paths: Iterator[Path],
    key_maker: Callable[[Path, dict], Optional[str]],
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            locale = path.parent.stem
            data_kind = key_maker(path, localized_data)

            for item in localized_data:
                if "translations" not in result[item]:
                    result[item]["translations"] = {}

                if locale not in result[item]["translations"]:
                    result[item]["translations"][locale] = {}

                result[item]["translations"][locale][data_kind] = localized_data[item]


if __name__ == "__main__":
    for data_type, transformer in DATA_TYPES.items():
        result: dict[str, Any] = {}

        extract_data(
            result,
            Path(".").glob(f"./{data_type}/{DATA_FOLDER}/*.toml"),
            transformer,
        )

        # doesn't need a transformer for now
        insert_translations(
            result,
            Path(".").glob(f"./{data_type}/{TRANSLATIONS_FOLDER}/*/*.toml"),
            transformer,
        )

        raw_filename = Path("raw") / Path(data_type).stem
        with open(raw_filename.with_suffix(".json"), "w+") as data_file:
            json.dump(result, data_file, separators=(",", ":"), sort_keys=True)

    print("Done!")
