#!/usr/bin/env python3
import os
import argparse
import tomlkit
import logging

# what addition/change is this? words, sandbox, luka_pona/signs, luka_pona/fingerspellings, languages, fonts
# is this a translation? y/n (doesn't apply to fonts/languages)
# what field are you editing?

LOG = logging.getLogger()

IJO_DIR = "/home/gregdan3/git/tokipona/ijo/sitelenpona/sitelen-seli-kiwen/"

RESOURCE_DIR = "https://raw.githubusercontent.com/lipu-linku/ijo/main/sitelenpona/sitelen-seli-kiwen/"

NOT_WRITTEN = {"li", "e", "la", "anu", "o", "pi", "a", "ali", "en"}


def main(argv: argparse.Namespace):
    LOG.setLevel(argv.log_level)
    tomls = [f for f in os.listdir(argv.directory) if f.endswith(".toml")]
    for toml in tomls:
        tomlname = os.path.join(argv.directory, toml)
        print(tomlname)
        with open(tomlname, "r") as f:
            data = tomlkit.loads(f.read())
            for key in {
                "book",
                "audio",
                "etymology",
                "ku_data",
                "source_language",
                "resources",
                "representations",
                "pu_verbatim",
                "author_verbatim",
                "author_verbatim_source",
                "see_also",
                "usage",
                "usage_category",
                "coined_year",
            }:
                if key in data:
                    del data[key]
                data["creation_date"] = ""
                data["author_commentary"] = ""
                data["author_commentary_source"] = ""
                data["usage"] = dict()
                data["usage_category"] = ""

            glyphs = [
                f.rstrip(".svg").rstrip(".png")
                for f in os.listdir(IJO_DIR)
                if f.endswith(".svg")
            ]
            for glyph in glyphs:
                if not data["word"] == glyph[: glyph.find("-")]:
                    continue

                data["glyphs"] = {}
                data["glyphs"]["sitelen_seli_kiwen"] = {}
                data["glyphs"]["sitelen_seli_kiwen"]["svg"] = (
                    RESOURCE_DIR + glyph + ".svg"
                )
                data["glyphs"]["sitelen_seli_kiwen"]["png"] = (
                    RESOURCE_DIR + glyph + ".png"
                )
                with open(f"glyphs/metadata/{glyph}.toml", "w") as dump:
                    dump.write(tomlkit.dumps(data))

            # edited_data = tomlkit.dumps(data)
            # f.truncate(0)
            # f.seek(0)
            # f.write(edited_data)


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
    parser.add_argument(
        "--directory",
        help="Specify a directory of TOML files to update",
        dest="directory",
        required=True,
        type=existing_directory,
    )
    ARGV = parser.parse_args()
    main(ARGV)
