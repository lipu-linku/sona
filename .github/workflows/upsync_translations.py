import os
import sys
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA
from utils import (
    cached_toml_read,
    deep_merge,
    find_files,
    get_path_values,
    load_data,
    load_languages,
    remove_orphaned_keys,
    write_toml,
)


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

                translation = cached_toml_read(tr_file)
                deep_merge(translation, source_data, overwrite_empty=True)
                remove_orphaned_keys(translation, source_data)
                write_toml(tr_file, translation)


if __name__ == "__main__":
    main()
