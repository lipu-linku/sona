import glob
import itertools
import json
import os
from typing import Any, Iterator

import tomlkit

data_types: dict[str, str | list[str]] = {
    "words": "metadata",
    "luka_pona": ["signs", "fingerspelling"],
}


def extract_data(
    result: dict[str, Any],
    paths: Iterator[str],
    data_type: str,
    subpath: bool,
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            raw_data = tomlkit.load(file)
            id = os.path.basename(path[: path.index(".toml")])
            data = {key: value for (key, value) in dict(raw_data).items()}

            if subpath:
                prefix = f"./{data_type}/"
                folder = path[
                    path.index(prefix) + len(prefix) : path.index(f"/{id}.toml")
                ]
                if folder not in result:
                    result[folder] = {}

                result[folder][id] = data
                result[folder][id]["translations"] = {}
            else:
                result[id] = data
                result[id]["translations"] = {}


def insert_translations(
    result: dict[str, Any], paths: Iterator[str], data_type: str, subpath: bool
):
    for path in paths:
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            locale = os.path.dirname(path)[path.rfind("/", 0, path.rfind("/")) + 1 :]
            data_kind = os.path.basename(path[: path.index(".toml")])

            for item in {item for item in localized_data.keys()}:
                if subpath:
                    prefix = f"./{data_type}/"
                    print(path)
                    folder = path[
                        path.index(prefix) + len(prefix) : path.index(
                            f"/translations/{locale}/{data_kind}.toml"
                        )
                    ]
                    if locale not in result[folder][item]["translations"]:
                        result[folder][item]["translations"][locale] = {}

                    result[folder][item]["translations"][locale][
                        data_kind
                    ] = localized_data[item]
                else:
                    if locale not in result[item]["translations"]:
                        result[item]["translations"][locale] = {}

                    result[item]["translations"][locale][data_kind] = localized_data[item]


if __name__ == "__main__":
    for data_type, folders in data_types.items():
        result: dict[str, Any] = {}

        extract_data(
            result,
            glob.iglob(f"./{data_type}/{folders}/*.toml")
            if isinstance(folders, str)
            else itertools.chain(
                *(glob.iglob(f"./{data_type}/{folder}/*.toml") for folder in folders)
            ),
            data_type,
            not isinstance(folders, str),
        )

        insert_translations(
            result,
            glob.iglob(f"./{data_type}/{folders}/translations/*/*.toml")
            if isinstance(folders, str)
            else itertools.chain(
                *(
                    glob.iglob(f"./{data_type}/{folder}/translations/*/*.toml")
                    for folder in folders
                )
            ),
            data_type,
            not isinstance(folders, str),
        )

        with open(f"./raw/{data_type}.json", "w+") as data_file:
            data_file.write(json.dumps(result, separators=(",", ":")))

    print("Done!")
