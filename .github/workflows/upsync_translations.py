import os
import sys
from pathlib import Path

from tomlkit import dumps

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA
from utils import (cached_toml_read, deep_merge, find_files, get_path_values,
                   load_languages)


def main():
    langs = load_languages()

    for key, config in DATA.items():
        if config["type"] != "locales":
            continue
        if not config.get("source"):
            continue

        input = config["input"]
        source = config["source"]
        for src_file in find_files(source):
            values = get_path_values(source, str(src_file))
            src_key = next(iter(values.values()))
            source_data = cached_toml_read(src_file)

            for lang_id, _ in langs.items():
                # TODO: these should be possible to derive, rather than hardcode
                tr_file = Path(input.format(**{"id": src_key, "langcode": lang_id}))
                print(f"Syncing {src_file} to {tr_file}")

                if not tr_file.exists():
                    tr_file.parent.mkdir(parents=True, exist_ok=True)

                translation = cached_toml_read(tr_file)
                deep_merge(translation, source_data, overwrite_empty=True)
                with open(tr_file, "w", encoding="utf-8") as f:
                    _ = f.write(dumps(translation, sort_keys=True))


if __name__ == "__main__":
    main()
