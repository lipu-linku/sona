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
NOTES = 12


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
    "primary": True,
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

LAST_VARIANT_ID: dict[str, int] = dict()


def parse_date(date_str: str, fmt: str):
    if date_str:
        return datetime.strptime(date_str, fmt)
    return None


def assemble_pu_data(word_data):
    id = word_data["id"]
    glyph_data = deepcopy(GLYPH_FORMAT)
    i = LAST_VARIANT_ID.get(id, 0) + 1
    LAST_VARIANT_ID[id] = i

    glyph_data["creation_date"] = "2014-05-25"
    glyph_data["creator_source"] = "lipu pu"
    if id in EARLY_GLYPHS:
        glyph_data["creation_date"] = "2023-05-19"
        glyph_data["creator_source"] = "https://tokipona.org/hieroglyphs_sample.pdf"

    glyph_data["id"] = id + f"-{i}"
    glyph_data["word"] = word_data["word"]
    glyph_data["word_id"] = id
    glyph_data["usage_category"] = word_data["usage_category"]
    glyph_data["creator"] = ["jan Sonja"]
    glyph_data["ligature"] = id + f"#{i}"
    glyph_data["ucsur"] = word_data["representations"].get("ucsur")
    if not glyph_data["ucsur"]:
        del glyph_data["ucsur"]

    glyph_data["image"] = (
        f"https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/{glyph_data['word']}.png"
    )
    glyph_data["svg"] = (
        f"https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/{glyph_data['word']}.svg"
    )
    glyph_data["primary"] = True

    glyph_data["name"] = [f"pu {word_data['word']}"]

    if word_data["word"] == "akesi":
        glyph_data["primary"] = False
        glyph_data["name"].extend(["6 leg akesi", "6 legged akesi"])

    if word_data["word"] == "ni":
        glyph_data["name"].extend(["down ni"])

    return glyph_data


def assemble_nonpu_data(word_data, row, len: int):
    id = word_data["id"]
    glyph_data = deepcopy(GLYPH_FORMAT)
    i = LAST_VARIANT_ID.get(id, 0) + 1
    LAST_VARIANT_ID[id] = i

    glyph_data["id"] = word_data["id"] + f"-{i}"
    glyph_data["word"] = word_data["word"]
    glyph_data["word_id"] = id
    glyph_data["usage_category"] = find_usage_category(word_data, row, len)

    glyph_data["creator"] = [
        creator.strip() for creator in row[CREATOR].split(",") if creator
    ]
    glyph_data["creation_date"] = row[CREATED]
    glyph_data["creator_source"] = row[SOURCE]
    glyph_data["primary"] = row[PRIMARY] == "Yes"

    glyph_data["ligature"] = id + f"#{i}"
    glyph_data["ucsur"] = word_data["representations"].get("ucsur")
    if not glyph_data["ucsur"]:
        del glyph_data["ucsur"]

    glyph_data["image"] = row[IMAGE]
    glyph_data["name"] = [
        name.strip().lower() for name in row[NAMES].split(",") if name
    ]
    glyph_data["commentary"] = row[NOTES]

    return glyph_data


def write_glyph_data(path: str, glyph_data) -> str:
    filename = glyph_data["id"] + ".toml"
    with open(os.path.join(path, filename), "w") as f:
        f.write(tomlkit.dumps(glyph_data))
    return glyph_data["id"]


def write_translation_data(path: str, filename: str, translations):
    filename += ".toml"
    with open(os.path.join(path, filename), mode="w") as f:
        f.write(tomlkit.dumps(translations))


def find_usage_category(word_data, row, len: int) -> str:
    """
    if it is the primary or only glyph for the word, it inherits the usage category of its word
    if it is a secondary or later glyph for the word, it inherits the usage category below its word unless it is a pu word, in which case it inherits the usage category two below.
    if we have data from the prior variant usage survey, we can use that to put a given glyph in a more appropriate category, but for the time being it cannot be placed above the word (because duh), and for pu words cannot go above common.
    """
    is_pu = word_data["book"] == "pu"
    is_primary = row[PRIMARY] == "Yes"
    notable = is_notable(word_data, row)
    word_category = word_data["usage_category"]
    if not notable:
        return "sandbox"
    if (len == 1 and not is_pu) or is_primary:
        return word_category
    if is_pu:
        return CATG_MAP_PU[word_category]
    return CATG_MAP_NORMAL[word_category]


def is_notable(word_data, row: list[str]) -> bool:
    appears = row[APPEARS]
    distinct = row[DISTINCT]
    primary = row[PRIMARY]
    is_sandbox = word_data["usage_category"]

    appears = appears == "Yes"
    distinct = distinct == "Yes"
    primary = primary == "Yes"
    is_sandbox = is_sandbox == "sandbox"

    main_glyph_of_non_sandbox = not is_sandbox and primary

    notable = (appears or main_glyph_of_non_sandbox) and (distinct or primary)
    return notable


def glyph_sort(glyphs: list[list[str]]):
    glyphs.sort(
        key=lambda row: (
            parse_date(row[CREATED], "%Y-%m-%d") or datetime.max,
            parse_date(row[TIMESTAMP], "%m/%d/%Y %H:%M:%S") or datetime.max,
        )
    )


def main(argv: argparse.Namespace):
    GLYPHS_OUTPUT = "./glyphs/metadata/"
    SANDBOX_OUTPUT = "./sandbox/glyphs/metadata/"
    TRANSLATIONS_OUTPUT = "./glyphs/source/"
    TRANSLATIONS_SANDBOX_OUTPUT = "./sandbox/glyphs/source/"

    LOG.setLevel(argv.log_level)
    written_ids: list[str] = list()
    sandbox_ids: list[str] = list()

    names = dict()
    names_sandbox = dict()

    commentary = dict()
    commentary_sandbox = dict()

    for id, word_data in WORDS_DATA.items():
        if id == "ali":  # the only synonym above sandbox
            continue

        # all pu handling
        if word_data["book"] == "pu":
            glyph_data = assemble_pu_data(word_data)
            names[glyph_data["id"]] = glyph_data.pop("name", "")
            commentary[glyph_data["id"]] = glyph_data.pop("commentary", "")
            written_id = write_glyph_data(GLYPHS_OUTPUT, glyph_data)
            written_ids.append(written_id)

        # find all the other glyphs for this word
        found_glyphs = []
        for row in GLYPH_DATA:
            if row[WORD] == id:
                found_glyphs.append(row)

        # remove those we won't track (for now)
        # TODO: override for all remaining non-sandbox such that at least one glyph exists there?

        sandbox_glyphs = [row for row in found_glyphs if not is_notable(word_data, row)]
        found_glyphs = [row for row in found_glyphs if is_notable(word_data, row)]

        # sort by creation date, or submission time if creation date not available
        glyph_sort(found_glyphs)
        glyph_sort(sandbox_glyphs)

        # all non-pu handling
        total_glyphs = len(found_glyphs)
        for i, row in enumerate(found_glyphs, 1):
            # note: non-pu glyphs for pu words will offset the given index
            glyph_data = assemble_nonpu_data(word_data, row, total_glyphs)

            names[glyph_data["id"]] = glyph_data.pop("name")
            commentary[glyph_data["id"]] = glyph_data.pop("commentary")

            written_id = write_glyph_data(GLYPHS_OUTPUT, glyph_data)
            written_ids.append(written_id)

        # all non-pu non-notable handling
        total_glyphs = len(sandbox_glyphs)
        for i, row in enumerate(sandbox_glyphs, 1):
            # note: non-pu glyphs for pu words will offset the given index
            glyph_data = assemble_nonpu_data(word_data, row, total_glyphs)

            names_sandbox[glyph_data["id"]] = glyph_data.pop("name")
            commentary_sandbox[glyph_data["id"]] = glyph_data.pop("commentary")

            sandbox_id = write_glyph_data(SANDBOX_OUTPUT, glyph_data)
            sandbox_ids.append(sandbox_id)

        write_translation_data(TRANSLATIONS_OUTPUT, "names", names)
        write_translation_data(TRANSLATIONS_OUTPUT, "commentary", commentary)

        write_translation_data(TRANSLATIONS_SANDBOX_OUTPUT, "names", names_sandbox)
        write_translation_data(
            TRANSLATIONS_SANDBOX_OUTPUT, "commentary", commentary_sandbox
        )

    # for id in written_ids:
    #     line = f'{id} = ""'
    #     print(line)
    #
    # for id in sandbox_ids:
    #     line = f'{id} = ""'
    #     print(line)


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
