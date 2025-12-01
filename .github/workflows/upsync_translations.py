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
    load_languages,
    write_toml,
)


def remove_orphaned_keys(translation: dict, source: dict, path=""):
    warnings = []
    keys_to_remove = [key for key in translation if key not in source]

    for key in keys_to_remove:
        print(f"Key '{path + key}' in translation but not source; removing.")
        del translation[key]

    for key in list(translation.keys()):
        if (
            key in source
            and isinstance(translation[key], dict)
            and isinstance(source[key], dict)
        ):
            sub_warnings = remove_orphaned_keys(
                translation[key], source[key], path + key + "."
            )
            warnings.extend(sub_warnings)

    return warnings


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
