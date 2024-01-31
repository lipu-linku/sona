import json
import os
from collections import defaultdict
from functools import partial

import tomlkit

JASIMA_DATA = "data.json"
CROWDIN_DATA = "crowdin.json"


def nested_defaultdict():
    return defaultdict(partial(defaultdict, dict))


EXCEPTIONS = ["yi", "eng-2", "eng", "lou"]
# all added since the move from sheets to crowdin


def resolve_id(linku_langs: dict, crowdin: dict, mappings: dict):
    id, twoletter, threeletter = (
        crowdin["id"],
        crowdin["twoLettersCode"],
        crowdin["threeLettersCode"],
    )
    if id in mappings:
        id = mappings[id]["two_letters_code"]
    if threeletter in linku_langs:
        return threeletter
    if twoletter in linku_langs:
        return twoletter
    if id in linku_langs:
        return id
    if id in EXCEPTIONS:
        return twoletter
    raise Exception("%s %s %s" % (id, twoletter, threeletter))


def main():
    os.makedirs("../languages/metadata", exist_ok=True)

    new_langs = nested_defaultdict()

    with open(JASIMA_DATA, "r") as f:
        jasima = json.loads(f.read())
        langs = jasima["languages"]
        for id, lang in langs.items():
            new_langs[id]["name_tok"] = lang["name_toki_pona"]
            new_langs[id]["name_en"] = lang["name_english"]
            new_langs[id]["endonym"] = lang["name_endonym"]

    with open(CROWDIN_DATA, "r") as f:
        data = json.loads(f.read())
        data = data["data"]
        mappings = data["languageMapping"]
        for lang in data["targetLanguages"]:
            target_id = resolve_id(new_langs, lang, mappings)
            assert target_id in new_langs or target_id in EXCEPTIONS
            new_langs[target_id]["locale"] = lang["locale"]
            if not new_langs[target_id]["name_en"]:
                new_langs[target_id]["name_en"] = lang["name"]
            # new_langs[target_id][""]

    with open("../languages/metadata/languages.toml", "w") as f:
        tomlified = tomlkit.dumps(new_langs, sort_keys=True)
        tomlified = "#:schema ../schemas/generated/languages.json\n" + tomlified
        f.write(tomlified)


if __name__ == "__main__":
    main()
