import json
from pathlib import Path
from typing import Any, Final, Iterator

import tomlkit

DATA_FOLDER: Final[str] = "metadata"
TRANSLATIONS_FOLDER: Final[str] = "translations"

DATA_TYPES: Final[set[str]] = {
    "words",
    "sandbox",
    "luka_pona/signs",
    "luka_pona/fingerspelling",
    "fonts",
    "languages",
}


def extract_data(
    result: dict[str, Any],
    paths: Iterator[Path],
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            result[path.stem] = tomlkit.load(file)


def insert_translations(result: dict[str, Any], paths: Iterator[Path]):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            locale = path.parent.stem
            data_kind = path.stem

            for item in localized_data:
                if "translations" not in result[item]:
                    result[item]["translations"] = {}

                if locale not in result[item]["translations"]:
                    result[item]["translations"][locale] = {}

                result[item]["translations"][locale][data_kind] = localized_data[item]


if __name__ == "__main__":
    for data_type in DATA_TYPES:
        result: dict[str, Any] = {}

        extract_data(
            result,
            Path(".").glob(f"./{data_type}/{DATA_FOLDER}/*.toml"),
        )

        insert_translations(
            result,
            Path(".").glob(f"./{data_type}/{TRANSLATIONS_FOLDER}/*/*.toml"),
        )

        raw_filename = Path("raw") / Path(data_type).stem
        with open(raw_filename.with_suffix(".json"), "w+") as data_file:
            json.dump(result, data_file, separators=(",", ":"), sort_keys=True)

    print("Done!")
