from collections import defaultdict
import os
import json
from typing import Any
import tomlkit
from functools import partial

from jsonify_nimi import jsonify_nimi

from converter import transform_to_list, noop, trash

TXT_DATA = jsonify_nimi()


JASIMA_DATA = "data.json"


def nested_defaultdict():
    return defaultdict(partial(defaultdict, dict))


TRANSFORMER = "t"
DESTINATION = "d"

FONTS = nested_defaultdict()


def transform_nullable_bool_string(field: str, nbstring: str):
    nbstring = nbstring.lower()
    if nbstring == "true":
        return True
    elif nbstring == "false":
        return False
    elif nbstring == "null":
        return None
    else:
        print("what the fuck is this: %s" % nbstring)


TRANSFORM_MAP = {
    "name_short": {TRANSFORMER: trash},
    "writing_system": {TRANSFORMER: noop, DESTINATION: FONTS},
    "links": {TRANSFORMER: partial(noop, _return_if_null=dict()), DESTINATION: FONTS},
    "creator": {
        TRANSFORMER: partial(transform_to_list, splitter="&"),
        DESTINATION: FONTS,
    },
    "license": {TRANSFORMER: noop, DESTINATION: FONTS},
    "version": {TRANSFORMER: noop, DESTINATION: FONTS},
    "last_updated": {TRANSFORMER: noop, DESTINATION: FONTS},
    "filename": {TRANSFORMER: noop, DESTINATION: FONTS},
    "style": {TRANSFORMER: noop, DESTINATION: FONTS},
    "features": {
        TRANSFORMER: partial(transform_to_list, splitter=","),
        DESTINATION: FONTS,
    },
    "ucsur": {TRANSFORMER: transform_nullable_bool_string, DESTINATION: FONTS},
    "ligatures": {TRANSFORMER: transform_nullable_bool_string, DESTINATION: FONTS},
}


def main():
    os.makedirs("../fonts", exist_ok=True)

    with open(JASIMA_DATA, "r") as f:
        jasima = json.loads(f.read())
        fonts = jasima["fonts"]

    for font, data in fonts.items():
        name = font
        font = data["name_short"]
        FONTS[font]["name"] = name
        for field in TRANSFORM_MAP.keys():
            fetched = data.get(field)
            formatted = TRANSFORM_MAP[field][TRANSFORMER](field, fetched)
            if formatted is not None:
                write_to = TRANSFORM_MAP[field][DESTINATION]
                write_to[font][field] = formatted

    for font, data in FONTS.items():
        data["$schema"] = "../schemas/generated/font.json"  # assumed
        with open(f"../fonts/{font}.toml", "w") as f:
            tomlified = tomlkit.dumps(data, sort_keys=True)
            f.write(tomlified)


if __name__ == "__main__":
    main()
