import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA
from package_data import FETCH_MAP
from utils import has_same_keys


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
    errors = []

    for key, config in DATA.items():
        tr_key = config.get("translations")
        if tr_key:
            translations = data.get(tr_key)
            if not translations:
                errors.append(f"{key} missing translation data")
                continue

            # confirm all listed langs are in translation data
            errs = report_set_diff(tr_key, set(langs), set(translations))
            errors.extend(errs)

            # confirm all data have corresponding keys in translations
            object_ids = set(data.get(key, {}))
            for langcode, tr_data in translations.items():
                errs = report_set_diff(f"{key} ({langcode})", object_ids, set(tr_data))
                errors.extend(errs)

        # confirm that all references have corresponding keys in other data
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
                        errors.append(
                            f"{key} ({obj_id}): unknown reference in '{ref_key}': '{ref_id}'"
                        )

    if errors:
        print("Errors found:")
        for errs in errors:
            print("-", errs)

        sys.exit("Error(s) found while checking references in toml data")
    else:
        print("Done!")


if __name__ == "__main__":
    main()
