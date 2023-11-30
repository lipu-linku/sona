from collections import defaultdict
import os
import json
from typing import Any
import tomlkit
from functools import partial

from jsonify_nimi import jsonify_nimi

TXT_DATA = jsonify_nimi()


JASIMA_DATA = "data.json"


def nested_defaultdict():
    return defaultdict(partial(defaultdict, dict))


def transform_ku_data(word: str, data: dict):
    return TXT_DATA.get(word) or None


def transform_etym_data(word: str, data: dict):
    if not data:
        return []
    etyms = []

    langs = data.get("langs", "").split(";")
    defs = data.get("defs", "").split(";")
    words = data.get("words", "").split(";")
    alts = data.get("alts", "").split(";")

    for lang, _def, word, alt in zip(langs, defs, words, alts):
        new_etym = dict()
        if lang:
            new_etym["language"] = lang
        if _def:
            new_etym["definition"] = _def
        if word:
            new_etym["word"] = word
        if alt:
            new_etym["alt"] = alt
        etyms.append(new_etym)
    return etyms


def transform_recognition_data(word: str, data: dict):
    new_recog = dict()
    for key, value in data.items():
        new_recog[key] = int(value)
    return new_recog


def transform_to_list(word: str, data: str, splitter: str = ",") -> list:
    return [elem.strip() for elem in data.split(splitter)] if data else []


def noop(word: str, data: dict, _return_if_null: Any = ""):
    return data if data else _return_if_null


def trash(word: str, data: dict):
    return None


TRANSFORM_MAP = {
    # NOTE: nasin nimi li sama nimi Linku
    "word": noop,
    "sitelen_pona": partial(transform_to_list, splitter=" "),
    "ucsur": noop,
    "sitelen_pona_etymology": trash,  # send to translate
    "sitelen_sitelen": noop,
    "sitelen_emosi": noop,
    "luka_pona": partial(noop, _return_if_null=dict()),
    "coined_year": noop,
    "coined_era": noop,
    "book": partial(noop, _return_if_null="none"),
    "usage_category": partial(noop, _return_if_null="obscure"),
    "source_language": partial(noop, _return_if_null="unknown"),
    "etymology": trash,
    "etymology_data": trash,  # to transform and send to translate
    "ku_data": transform_ku_data,
    "recognition": transform_recognition_data,
    "see_also": partial(transform_to_list, splitter=","),
    "tags": trash,
    "author_verbatim": noop,
    "author_verbatim_source": noop,
    "pu_verbatim": partial(noop, _return_if_null=None),
    "commentary": trash,  # send to translate
    "def": trash,
}

TRANSLATION_MAP = {
    "etymology_data": transform_etym_data,
    "commentary": noop,
    "sitelen_pona_etymology": noop,
}


def main():
    os.makedirs("../translations", exist_ok=True)
    os.makedirs("../words", exist_ok=True)

    with open(JASIMA_DATA, "r") as f:
        jasima = json.loads(f.read())
        langs = jasima["languages"]
        data = jasima["data"]

    words = nested_defaultdict()
    translations = nested_defaultdict()
    for word in data.keys():
        for field in TRANSFORM_MAP.keys():
            fetched = data[word].get(field)
            formatted = TRANSFORM_MAP[field](word, fetched)
            if formatted is not None:
                words[word][field] = formatted

        for lang in langs.keys():
            translations[lang][word]["def"] = data[word]["def"].get(lang) or ""
            for field in TRANSLATION_MAP:
                fetched = data[word].get(field)
                formatted = TRANSLATION_MAP[field](word, fetched)

                # TODO: key-aware transform
                if field == "etymology_data":
                    field = "etymology"

                if formatted is not None:
                    translations[lang][word][field] = formatted

                # if field == "ucsur":
                #     codepoint = data[word].get("ucsur")
                #     character = ""
                #     if codepoint:
                #         character = chr(int(codepoint[2:], base=16))
                #     words[word]["ucsur_codepoint"] = codepoint
                #     words[word]["ucsur_character"] = character
                #     continue

    # TODO: order keys freely instead of alphabetically
    # or crowdin will solve this for us
    for word, worddata in words.items():
        with open(f"../words/{word}.toml", "w") as f:
            tomlified = tomlkit.dumps(worddata, sort_keys=True)
            f.write(tomlified)

    for lang, translationdata in translations.items():
        # TODO: fix Pingo being at the top
        tomlified = tomlkit.dumps(translationdata, sort_keys=True)
        with open(f"../translations/{lang}.toml", "w") as f:
            f.write(tomlified)


if __name__ == "__main__":
    main()
