#!/usr/bin/env python3
import argparse
import csv
import json
import logging
import os
from copy import deepcopy
from datetime import datetime

import tomlkit

# what addition/change is this? words, sandbox, luka_pona/signs, luka_pona/fingerspellings, languages, fonts
# is this a translation? y/n (doesn't apply to fonts/languages)
# what field are you editing?

LOG = logging.getLogger()

with open("./words.json", "r") as f:
    data = f.read()
WORDS_DATA = json.loads(data)

with open("./sandbox.json", "r") as f:
    data = f.read()
SANDBOX_DATA = json.loads(data)

LINKU_DATA = {**WORDS_DATA, **SANDBOX_DATA}

with open("glyphs.csv", "r") as f:
    data = f.readlines()
    reader = csv.reader(data)
    GLYPH_DATA = list(reader)

TIMESTAMP = 0
WORD = 1
IMAGE = 2
APPEARS = 3
DISTINCT = 4
CREATED = 5
SOURCE = 6
CREATOR = 7
NAMES = 8
PRIMARY = 9
NOTES = 11


SANDBOX_START = "./sandbox/"
WORDS_START = "./words/"

GLYPH_FORMAT = {
    "id": "",
    "word": "",
    "word_id": "",
    "name": [],
    "usage_category": "",
    # "creator_verbatim": ""
    "creator_source": "",
    "creator": [],
    "creation_date": "",
    "is_primary": True,
    "deprecated": False,
    #
    # "representations": {
    "image": "",
    "svg": "",
    "ligature": "",  # should be word#1
    "ucsur": "",
    # "unicode": "", # one day...
    # },
    #
    "usage": {},
}

EARLY_GLYPHS = {
    "li",
    "lili",
    "linja",
    "lipu",
    #
    "loje",
    "lon",
    "luka",
    "lukin",
    #
    "lupa",
    "ma",
    "mama",
    "mani",
    #
    "meli",
    "mi",
    "mije",
    "moku",
    #
    "moli",
    "monsi",
    "mu",
    "mun",
}

CATG_MAP_NORMAL = {
    "core": "common",
    "common": "uncommon",
    "uncommon": "obscure",
    "obscure": "sandbox",
}
CATG_MAP_PU = {
    "core": "uncommon",
    "common": "obscure",
    "uncommon": "sandbox",
    "obscure": "sandbox",
}


def parse_date(date_str: str, fmt: str):
    if date_str:
        return datetime.strptime(date_str, fmt)
    return None


def assemble_pu_data(word_data):
    id = word_data["id"]
    glyph_data = deepcopy(GLYPH_FORMAT)

    glyph_data["creation_date"] = "2014-05-25"
    glyph_data["creator_source"] = "lipu pu"
    if id in EARLY_GLYPHS:
        glyph_data["creation_date"] = "2023-05-19"
        glyph_data["creator_source"] = "https://tokipona.org/hieroglyphs_sample.pdf"

    glyph_data["id"] = id + "-1"
    glyph_data["word"] = word_data["word"]
    glyph_data["word_id"] = id
    glyph_data["usage_category"] = word_data["usage_category"]
    glyph_data["creator"] = ["jan Sonja"]
    glyph_data["ligature"] = id + "#1"
    glyph_data["ucsur"] = word_data["representations"].get("ucsur")
    if not glyph_data["ucsur"]:
        del glyph_data["ucsur"]

    glyph_data["image"] = (
        f"https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/{glyph_data['word']}.png"
    )
    glyph_data["svg"] = (
        f"https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/{glyph_data['word']}.svg"
    )

    glyph_data["is_primary"] = True
    return glyph_data


def assemble_nonpu_data(word_data, row, i: int, len: int):
    id = word_data["id"]
    glyph_data = deepcopy(GLYPH_FORMAT)

    if word_data["book"] == "pu":
        i += 1

    glyph_data["id"] = word_data["id"] + f"-{i}"
    glyph_data["word"] = word_data["word"]
    glyph_data["word_id"] = id
    glyph_data["usage_category"] = find_usage_category(word_data, row, i, len)

    glyph_data["creator"] = [
        creator.strip() for creator in row[CREATOR].split(",") if creator
    ]
    glyph_data["creation_date"] = row[CREATED]
    glyph_data["creator_source"] = row[SOURCE]
    glyph_data["is_primary"] = row[PRIMARY] == "Yes"

    glyph_data["ligature"] = id + f"#{i}"
    glyph_data["ucsur"] = word_data["representations"].get("ucsur")
    if not glyph_data["ucsur"]:
        del glyph_data["ucsur"]

    glyph_data["image"] = row[IMAGE]
    glyph_data["name"] = [
        name.strip().lower() for name in row[NAMES].split(",") if name
    ]

    return glyph_data


def write_glyph_data(argv, glyph_data):
    filename = glyph_data["id"] + ".toml"
    with open(os.path.join(argv.directory, filename), "w") as f:
        f.write(tomlkit.dumps(glyph_data))


def find_usage_category(word_data, row, i: int, len: int) -> str:
    """
    if it is the primary or only glyph for the word, it inherits the usage category of its word
    if it is a secondary or later glyph for the word, it inherits the usage category below its word unless it is a pu word, in which case it inherits the usage category two below.
    if we have data from the prior variant usage survey, we can use that to put a given glyph in a more appropriate category, but for the time being it cannot be placed above the word (because duh), and for pu words cannot go above common.
    """
    is_pu = word_data["book"] == "pu"
    is_primary = row[PRIMARY] == "Yes"
    word_category = word_data["usage_category"]
    if (len == 1 and not is_pu) or is_primary:
        return word_category
    if is_pu:
        return CATG_MAP_PU[word_category]
    return CATG_MAP_NORMAL[word_category]


def main(argv: argparse.Namespace):
    LOG.setLevel(argv.log_level)
    for id, word_data in WORDS_DATA.items():
        if id == "ali":  # the only synonym above sandbox
            continue

        if word_data["book"] == "pu":
            glyph_data = assemble_pu_data(word_data)
            write_glyph_data(argv, glyph_data)

        found_glyphs = []
        for row in GLYPH_DATA:
            if row[WORD] == id:
                found_glyphs.append(row)

        found_glyphs = [
            row
            for row in found_glyphs
            if row[APPEARS] == "Yes"
            and (row[DISTINCT] == "Yes" or row[PRIMARY] == "Yes")
        ]

        found_glyphs.sort(
            key=lambda row: (
                parse_date(row[CREATED], "%Y-%m-%d") or datetime.max,
                parse_date(row[TIMESTAMP], "%m/%d/%Y %H:%M:%S") or datetime.max,
            )
        )

        total_glyphs = len(found_glyphs)
        for i, row in enumerate(found_glyphs, 1):
            glyph_data = assemble_nonpu_data(word_data, row, i, total_glyphs)
            write_glyph_data(argv, glyph_data)


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
