#!/usr/bin/env python3
import os
import argparse
import tomlkit
import logging

# what addition/change is this? words, sandbox, luka_pona/signs, luka_pona/fingerspellings, languages, fonts
# is this a translation? y/n (doesn't apply to fonts/languages)
# what field are you editing?

LOG = logging.getLogger()

NOT_WRITTEN = {"li", "e", "la", "anu", "o", "pi", "a", "ali", "en"}


def main(argv: argparse.Namespace):
    LOG.setLevel(argv.log_level)
    tomls = [f for f in os.listdir(argv.directory) if f.endswith(".toml")]
    for toml in tomls:
        tomlname = os.path.join(argv.directory, toml)
        print(tomlname)
        with open(tomlname, "r+") as f:
            data = tomlkit.loads(f.read())

            word = data["word"]
            if word in {"meli", "mije"}:
                word = "mije-and-meli"  # just for lipamanka
            wiki_link = data.pop("sona_pona", None)

            data["resources"] = dict()
            if wiki_link:
                data["resources"]["sona_pona"] = wiki_link
            if data["book"] == "pu" and data["word"] not in NOT_WRITTEN:
                data["resources"][
                    "lipamanka_semantic"
                ] = f"https://lipamanka.gay/essays/dictionary#{word}"

            # move sp to ligatures
            sp = data["representations"].pop("sitelen_pona")
            if not sp:
                sp.append(data["word"])
            data["representations"]["ligatures"] = sp

            # split ucsur
            codepoint = data["representations"].pop("ucsur")
            if codepoint:  # implicit delete
                data["representations"]["ucsur"] = codepoint
                # int(codepoint[2:], 16)

            # clean empty emosi, ss fields
            emosi = data["representations"].pop("sitelen_emosi")
            if emosi:  # implicit delete
                data["representations"]["sitelen_emosi"] = emosi

            sitelen = data["representations"].pop("sitelen_sitelen")
            if sitelen:  # implicit delete
                data["representations"]["sitelen_sitelen"] = sitelen

            edited_data = tomlkit.dumps(data)
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
