import os
import sys
from pathlib import Path

from tomlkit import dumps

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA
from utils import (cached_toml_read, deep_merge, find_files, get_bound_param,
                   get_path_values, get_unbound_param)


def main():
    for key, config in DATA.items():
        if config["type"] != "locales":
            continue
        if not config.get("source"):
            continue

        input = config["input"]
        output = config["output"]

        filename_param = get_unbound_param(input, output)
        langcode_param = get_bound_param(input, output)

        for tr_file in find_files(input):
            values = get_path_values(input, str(tr_file))

            source_file = Path(config["source"].format(**values))
            print(f"Syncing {source_file} to {tr_file}")

            source = cached_toml_read(source_file)
            translation = cached_toml_read(tr_file)

            deep_merge(translation, source, overwrite_empty=True)

            with open(tr_file, "w", encoding="utf-8") as f:
                f.write(dumps(translation, sort_keys=True))


if __name__ == "__main__":
    main()
