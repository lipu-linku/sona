#!/usr/bin/env python3
import os
import argparse
import tomlkit
import logging
from collections import defaultdict
from functools import partial

# what addition/change is this? words, sandbox, luka_pona/signs, luka_pona/fingerspellings, languages, fonts
# is this a translation? y/n (doesn't apply to fonts/languages)
# what field are you editing?

LOG = logging.getLogger()

IJO_DIR = "/home/gregdan3/git/tokipona/ijo/sitelenpona/sitelen-seli-kiwen/"

RESOURCE_DIR = "https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/"


def nested_defaultdict():
    return defaultdict(partial(defaultdict, dict))


def create_metadata(glyph: str):
    data = dict()
    data["creation_date"] = ""
    data["author_commentary"] = ""
    data["author_commentary_source"] = ""
    data["usage"] = dict()
    data["usage_category"] = ""
    data["glyphs"] = dict()
    data["glyphs"]["sitelen_seli_kiwen"] = dict()
    data["glyphs"]["sitelen_seli_kiwen"]["svg"] = RESOURCE_DIR + glyph + ".svg"
    data["glyphs"]["sitelen_seli_kiwen"]["png"] = RESOURCE_DIR + glyph + ".png"
    return data


def main(argv: argparse.Namespace):
    LOG.setLevel(argv.log_level)
    glyphs = [f.rstrip(".svg") for f in os.listdir(IJO_DIR) if f.endswith(".svg")]
    output = nested_defaultdict()
    for glyph in glyphs:
        if "-" not in glyph:
            continue

        word = glyph[: glyph.find("-")]

        output[word]["primary"] = f"{word}-1"
        output[word][glyph.replace("-", "_")] = create_metadata(glyph)

    for word, data in output.items():
        print(word)
        with open(f"glyphs/metadata/{word}.toml", "w") as dump:
            dump.write(tomlkit.dumps(data, sort_keys=True))


### Typing utils for argparse
def existing_directory(dir_path: str) -> str:
    if os.path.isdir(dir_path):
        return dir_path
    raise NotADirectoryError(dir_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Script to update locally tracked fonts"
    )
    parser.add_argument(
        "--log-level",
        help="Set the log level",
        type=str.upper,
        dest="log_level",
        default="INFO",
        choices=["NOTSET", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    )
    ARGV = parser.parse_args()
    main(ARGV)
