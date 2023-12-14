#!/bin/python3

from converter import (
    transform_to_list,
    noop,
    trash,
    nested_defaultdict,
    write_translated,
)
from functools import partial
from io import StringIO
import csv
import os
import re
import tomlkit
import urllib.request

SHEET = "https://docs.google.com/spreadsheets/d/1xwgTAxwgn4ZAc4DBnHte0cqta1aaxe112Wh1rv9w5Yk/pub?gid=1041194100&single=true&output=csv"


T = "t"
D = "d"

LANGUAGES = ["en", "tok"]  # hardcoded bc there are only two
LUKAPONA = nested_defaultdict()
ICONS = nested_defaultdict()
LP_ETYMOLOGY = nested_defaultdict()
TR_PARAMETERS = nested_defaultdict()
PARAMETERS = nested_defaultdict()
ETYMOLOGY = nested_defaultdict()


def transform_name(new_gloss: str):
    if ";" in new_gloss:
        new_gloss = new_gloss.split(";")[0].strip()
    return new_gloss


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
    "old_gloss": {T: noop, D: LUKAPONA},
    "new_gloss": {T: noop, D: LUKAPONA},
    "def": {T: noop, D: LUKAPONA},
    "video": {T: partial(noop, _return_if_null=dict()), D: LUKAPONA},
    "signwriting": {T: partial(noop, _return_if_null=dict()), D: LUKAPONA},
    "etymology": {T: transform_etymology, D: LUKAPONA},
    "handshape": {T: noop, D: PARAMETERS},
    "is_two_handed": {T: transform_is_two_handed, D: LUKAPONA},
    "icon": {T: noop, D: ICONS},
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
    os.makedirs("../lukapona", exist_ok=True)

    lukapona = build_dict_from_sheet(SHEET)

    for key, data in lukapona.items():
        name = transform_name(data["new_gloss"])  # filename to be used
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

                if field == "def":  # special case
                    field = "definition"
                write_to[name][field] = formatted

    for key, data in LUKAPONA.items():
        data["$schema"] = "../schemas/generated/lukapona.json"  # assumed
        with open(f"../lukapona/{key}.toml", "w") as f:
            tomlified = tomlkit.dumps(data, sort_keys=True)
            f.write(tomlified)

    write_translated(
        ICONS,
        "../translations",
        "lukapona_icons.toml",
        schema="../../schemas/generated/lukapona_icons.json",
    )


if __name__ == "__main__":
    main()
