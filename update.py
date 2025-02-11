#!/usr/bin/env python3
import argparse
import json
import logging
import os
from copy import deepcopy

import tomlkit

# what addition/change is this? words, sandbox, luka_pona/signs, luka_pona/fingerspellings, languages, fonts
# is this a translation? y/n (doesn't apply to fonts/languages)
# what field are you editing?

LOG = logging.getLogger()

# NOT_WRITTEN = {"li", "e", "la", "anu", "o", "pi", "a", "ali", "en"}
with open("/home/gregdan3/words.json", "r") as f:
    data = f.read()
LINKU_DATA = json.loads(data)


SANDBOX_START = "./sandbox/"
WORDS_START = "./words/"


def main(argv: argparse.Namespace):
    LOG.setLevel(argv.log_level)
    for root, _, files in os.walk(argv.directory):
        is_major = True
        if root.startswith(SANDBOX_START):
            is_major = False

        if "/metadata" in root:
            continue
        for filename in files:
            if "parameters" in filename:
                continue
            tomlname = os.path.join(root, filename)
            print(tomlname)
            with open(tomlname, "r+") as f:
                data = tomlkit.loads(f.read())
                edited_data = deepcopy(data)
                for key in data.keys():
                    if key in LINKU_DATA and not is_major:
                        # if the key is a word above sandbox,
                        # but we are in sandbox,
                        # delete
                        del edited_data[key]
                    if key not in LINKU_DATA and is_major:
                        # if the key is a word in sandbox,
                        # but we are in words,
                        # delete
                        del edited_data[key]

                edited_data = tomlkit.dumps(edited_data)
                f.truncate(0)
                f.seek(0)
                f.write(edited_data)


### Typing utils for argparse
def existing_directory(dir_path: str) -> str:
    if os.path.isdir(dir_path):
        return dir_path
    raise NotADirectoryError(dir_path)


def existing_file(file_path: str) -> str:
    if os.path.isfile(file_path):
        return file_path
    raise FileNotFoundError(file_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    _ = parser.add_argument(
        "--log-level",
        help="Set the log level",
        type=str.upper,
        dest="log_level",
        default="INFO",
        choices=["NOTSET", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    )
    _ = parser.add_argument(
        "--directory",
        help="Specify a directory of TOML files to update",
        dest="directory",
        required=True,
        type=existing_directory,
    )
    ARGV = parser.parse_args()
    main(ARGV)
