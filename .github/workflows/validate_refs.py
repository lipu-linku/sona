import os
import sys
from pathlib import Path

import tomlkit

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA
from package_data import FETCH_MAP
from utils import (cached_toml_read, find_files, get_bound_param,
                   get_path_values, get_unbound_param)


def load_data():
    data = dict()
    for key, config in DATA.items():
        input = config["input"]
        output = config["output"]
        typ = config["type"]
        fetcher = FETCH_MAP[typ]
        data[key] = fetcher(input, output)
    return data


def report_set_diff(name: str, expected: set, actual: set) -> list[str]:
    missing = expected - actual
    extra = actual - expected

    results = list()

    if missing:
        results.append(f"{name} missing keys {missing}")

    if extra:
        results.append(f"{name} has extra keys {extra}")

    return results


def main():
    """
    - Fetch langs
    - Confirm all langs exist in all types with translations
    - Fetch each type
    - Confirm each id of each type exists in all translations

    - Check special cases ("see also" in words has existing references in the same data)
    """
    data = load_data()
    langs = data["languages"]
    found_errs = False

    for key, config in DATA.items():
        tr_key = config.get("translations")
        if tr_key:
            translations = data.get(tr_key)
            if not translations:
                print(f"{key} missing translation data")
                found_errs = True
                continue

            # confirm all listed langs are in translation data
            errs = report_set_diff(tr_key, set(langs), set(translations))
            for err in errs:
                print(err)
                found_errs = True

            # confirm all data have corresponding keys in translations
            tr_config = DATA[tr_key]
            input = tr_config["input"]
            output = tr_config["output"]

            filename_param = get_unbound_param(input, output)
            langcode_param = get_bound_param(input, output)
            for tr_file in find_files(input):
                values = get_path_values(input, str(tr_file))
                source_file = Path(tr_config["source"].format(**values))

                langcode = values[langcode_param]
                filename = values[filename_param]

                source = cached_toml_read(source_file)
                translation = cached_toml_read(tr_file)

                errs = report_set_diff(
                    f"{key} -> {langcode} -> {filename}",
                    set(source),
                    set(translation),
                )

                for object_id in source.keys():
                    if object_id not in translation:
                        print(
                            f"{key} -> {langcode} -> {filename} missing key {object_id}",
                        )
                        found_errs = True
                        continue
                    if source.get(object_id) and not translation.get(object_id):
                        print(
                            f"{key} -> {langcode} -> {filename} has empty key {object_id}",
                        )
                        found_errs = True
                        continue

        # confirm all refs have valid keys in target data
        refs = config.get("refs", [])
        for ref in refs:
            ref_key = ref["key"]
            ref_targets = ref["to"]

            valid_ids = set()
            for target in ref_targets:
                # every id that this type can target
                valid_ids.update(data.get(target, {}).keys())

            for obj_id, obj_data in data[key].items():
                raw_refs = obj_data.get(ref_key)

                if isinstance(raw_refs, str):
                    raw_refs = [raw_refs]
                    # if it isn't a str or list[str],
                    # that's a toml validation error

                for ref_id in raw_refs:
                    if ref_id not in valid_ids:
                        print(
                            f"{key} ({obj_id}): unknown reference in '{ref_key}': '{ref_id}'"
                        )
                        found_errs = True

    if found_errs:
        sys.exit("Error(s) found while checking references in toml data")

    print("Done!")


if __name__ == "__main__":
    main()
