import os
import sys
import tomllib
from collections import defaultdict
from pathlib import Path

# this lets you import from files in the same dir
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import CURRENT_API_VERSION, DATA
from utils import (find_files, get_bound_param, get_path_values,
                   get_unbound_param, substitute_params, write_json)


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
