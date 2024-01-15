#!/bin/python3
# yes i did just copy the lukapona one

import csv
import os
import re
import urllib.request
from functools import partial
from io import StringIO

import tomlkit

from converter import nested_defaultdict, noop

SHEET = "https://docs.google.com/spreadsheets/d/1xwgTAxwgn4ZAc4DBnHte0cqta1aaxe112Wh1rv9w5Yk/pub?gid=174073871&single=true&output=csv"


T = "t"
D = "d"

LUKAPONA = nested_defaultdict()
LP_ETYMOLOGY = nested_defaultdict()
PARAMETERS = nested_defaultdict()
PARAMETERS_TOK = nested_defaultdict()
ETYMOLOGY = nested_defaultdict()


def transform_is_two_handed(field: str, is_two_handed: dict):
    en_field = is_two_handed.get("en") if is_two_handed else None
    if en_field:
        return True
    return False


def transform_etymology(field: str, data: dict):
    etyms = []

    languages = data.get("source_language", "").split(";")
    signs = data.get("etymology", "").split(";")

    for language, sign in zip(languages, signs):
        newdata = {}
        if language:
            newdata["language"] = language.strip()
        if sign:
            newdata["sign"] = sign.strip()
        etyms.append(newdata)
    return etyms


TRANSFORM_MAP = {
    "id": {T: noop, D: LUKAPONA},
    "video": {T: partial(noop, _return_if_null=dict()), D: LUKAPONA},
    "signwriting": {T: partial(noop, _return_if_null=dict()), D: LUKAPONA},
    "etymology": {T: transform_etymology, D: LUKAPONA},
    "is_two_handed": {T: transform_is_two_handed, D: LUKAPONA},
}

TRANSLATABLE_MAP = {
    "handshape": {T: noop, D: PARAMETERS},
    "movement": {T: noop, D: PARAMETERS},
    "placement": {T: noop, D: PARAMETERS},
    "orientation": {T: noop, D: PARAMETERS},
}


def get_site(link):
    return urllib.request.urlopen(link).read().decode("utf8")


def clean_whitespace(s: str) -> str:
    """Strip whitespace from beginning/end; strip duplicate whitespace other than newlines from middle"""
    s = s.strip()
    s = re.sub(r"\s*\n\s*", "\n", s)
    s = re.sub(r"[ \t\r\f]+", " ", s)
    return s


def build_dict_from_sheet(link):
    """stolen from jasima"""
    raw_sheet = get_site(link)

    # datasheet takes a file-like object, so we use StringIO
    datasheet = csv.reader(StringIO(raw_sheet))

    # next() consumes the first line of the sheet
    keys = next(datasheet)

    ID_COLUMN = keys.index("id")
    keys.pop(ID_COLUMN)

    data = {}
    for row in datasheet:
        entry = {}
        entry_id = row.pop(ID_COLUMN)

        for index, cell in enumerate(row):
            cell = clean_whitespace(cell)
            if not cell:
                continue

            if "/" not in keys[index]:
                entry[keys[index]] = cell
            else:
                # e.g. 'def/en':
                # outer = 'def'
                # inner = 'en'
                outer, inner = keys[index].split("/")
                if outer not in entry:
                    entry[outer] = {}
                assert isinstance(entry[outer], dict), (
                    "Parent key %s has non-dict child. Is the sheet malformed?" % outer
                )
                # if parent key has same name as a normal key
                entry[outer][inner] = cell

        data[entry_id] = entry

    # Sort by id, case insensitive
    data = {k: v for k, v in sorted(data.items(), key=lambda x: x[0].lower())}

    return data


def main():
    os.makedirs("../fingerspelling", exist_ok=True)

    fingerspelling = build_dict_from_sheet(SHEET)

    for key, data in fingerspelling.items():
        data["id"] = key 

        data["etymology"] = {  # WARN: cheating
            "etymology": data.get("etymology", ""),
            "source_language": data["source_language"],
        }

        for field in TRANSFORM_MAP.keys():
            # print(field)
            fetched = data.get(field)
            formatted = TRANSFORM_MAP[field][T](field, fetched)
            if formatted is not None:
                write_to = TRANSFORM_MAP[field][D]
                write_to[key][field] = formatted

        for field in TRANSLATABLE_MAP:
            endata = data.get(field, {}).get("en")
            tokdata = data.get(field, {}).get("tok")
            if endata:
                PARAMETERS[key][field] = endata
            if tokdata:
                PARAMETERS_TOK[key][field] = tokdata

    for key, data in LUKAPONA.items():
        data["$schema"] = "../schemas/generated/fingerspelling.json"  # assumed
        with open(f"../fingerspelling/{key}.toml", "w") as f:
            tomlified = tomlkit.dumps(data, sort_keys=True)
            f.write(tomlified)

    with open("../source/fingerspelling_parameters.toml", "w") as f:
        PARAMETERS["$schema"] = "../schemas/generated/parameters_translation.json"
        tomlified = tomlkit.dumps(PARAMETERS, sort_keys=True)
        f.write(tomlified)

    with open("../translations/tok/fingerspelling_parameters.json", "w") as f:
        PARAMETERS_TOK["$schema"] = "../../schemas/generated/parameters_translation.json"
        tomlified = tomlkit.dumps(PARAMETERS_TOK, sort_keys=True)
        f.write(tomlified)


if __name__ == "__main__":
    main()
