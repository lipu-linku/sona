import glob
import json
import os
from typing import Any, Final, Iterator

import tomlkit

DATA_FOLDER: Final[str] = "metadata"
TRANSLATIONS_FOLDER: Final[str] = "translations"

DATA_TYPES: Final[set[str]] = {
    "words",
    "luka_pona/signs",
    "luka_pona/fingerspelling",
    "fonts/",
}


def extract_data(
    result: dict[str, Any],
    paths: Iterator[str],
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            raw_data = tomlkit.load(file)
            id = os.path.basename(path[: path.index(".toml")])
            data = {key: value for (key, value) in dict(raw_data).items()}

            result[id] = data


def insert_translations(result: dict[str, Any], paths: Iterator[str]):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            locale = os.path.dirname(path)[path.rfind("/", 0, path.rfind("/")) + 1 :]
            data_kind = os.path.basename(path[: path.index(".toml")])

            for item in {item for item in localized_data.keys()}:
                if "translations" not in result[item]:
                    result[item]["translations"] = {}

                if locale not in result[item]["translations"]:
                    result[item]["translations"][locale] = {}

                result[item]["translations"][locale][data_kind] = localized_data[item]


if __name__ == "__main__":
    for data_type in DATA_TYPES:
        result: dict[str, Any] = {}

        extract_data(result, glob.iglob(f"./{data_type}/{DATA_FOLDER}/*.toml"))

        insert_translations(
            result,
            glob.iglob(f"./{data_type}/{TRANSLATIONS_FOLDER}/*/*.toml"),
        )

        raw_filename = data_type[0 if (i := data_type.find("/")) == -1 else i :]
        with open(f"./raw/{raw_filename}.json", "w+") as data_file:
            json.dump(result, data_file, separators=(",", ":"))

    print("Done!")
