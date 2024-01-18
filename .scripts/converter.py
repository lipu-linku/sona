import json
import os
from collections import defaultdict
from functools import partial
from typing import Any

import tomlkit
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
    transable_etyms = []

    transable_etyms = []
    untransable_etyms = []

    langs = data.get("langs", "").split(";")
    defs = data.get("defs", "").split(";")
    words = data.get("words", "").split(";")
    alts = data.get("alts", "").split(";")

    assert len(langs) == len(defs) == len(words), f"{langs}, {defs}, {words}, {alts}"

    for lang, _def, word, alt in zip(langs, defs, words, alts):
        transable = dict()
        untransable = dict()
        if lang:
            transable["language"] = lang
        if _def:
            transable["definition"] = _def
        if word:
            untransable["word"] = word
        if alt:
            untransable["alt"] = alt
        transable_etyms.append(transable)
        untransable_etyms.append(untransable)
    return transable_etyms, untransable_etyms


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


WORDS = nested_defaultdict()
REPRESENTATIONS = nested_defaultdict()
DEFINITIONS = nested_defaultdict()

COMMENTARY = nested_defaultdict()
SP_ETYMOLOGY = nested_defaultdict()
ETYMOLOGY = nested_defaultdict()

TRANSFORMER = "t"
DESTINATION = "d"


TRANSFORM_MAP = {
    "word": {TRANSFORMER: noop, DESTINATION: WORDS},
    # NOTE: this could be in `representations` but we decided against that
    "sitelen_pona": {
        TRANSFORMER: partial(transform_to_list, splitter=" "),
        DESTINATION: REPRESENTATIONS,
    },
    "ucsur": {TRANSFORMER: noop, DESTINATION: REPRESENTATIONS},
    "sitelen_pona_etymology": {TRANSFORMER: trash},  # send to translate
    "sitelen_sitelen": {TRANSFORMER: noop, DESTINATION: REPRESENTATIONS},
    "sitelen_emosi": {TRANSFORMER: noop, DESTINATION: REPRESENTATIONS},
    # "luka_pona": {TRANSFORMER: partial(noop, _return_if_null=dict()), DESTINATION: WORDS},
    "luka_pona": {TRANSFORMER: trash},  # to be replaced with totally different doc
    "audio": {TRANSFORMER: partial(noop, _return_if_null=dict()), DESTINATION: WORDS},
    "coined_year": {TRANSFORMER: noop, DESTINATION: WORDS},
    "coined_era": {TRANSFORMER: noop, DESTINATION: WORDS},
    "book": {TRANSFORMER: partial(noop, _return_if_null="none"), DESTINATION: WORDS},
    "usage_category": {
        TRANSFORMER: partial(noop, _return_if_null="obscure"),
        DESTINATION: WORDS,
    },
    "source_language": {
        TRANSFORMER: partial(noop, _return_if_null="unknown"),
        DESTINATION: WORDS,
    },
    "etymology": {TRANSFORMER: trash},
    "etymology_data": {TRANSFORMER: trash},  # to transform and send to translate
    "creator": {
        TRANSFORMER: partial(transform_to_list, splitter=","),
        DESTINATION: WORDS,
    },
    "ku_data": {TRANSFORMER: transform_ku_data, DESTINATION: WORDS},
    "recognition": {TRANSFORMER: transform_recognition_data, DESTINATION: WORDS},
    "see_also": {
        TRANSFORMER: partial(transform_to_list, splitter=","),
        DESTINATION: WORDS,
    },
    "tags": {TRANSFORMER: trash},
    "author_verbatim": {TRANSFORMER: noop, DESTINATION: WORDS},
    "author_verbatim_source": {TRANSFORMER: noop, DESTINATION: WORDS},
    "pu_verbatim": {
        TRANSFORMER: partial(noop, _return_if_null=None),
        DESTINATION: WORDS,
    },
    "commentary": {TRANSFORMER: trash},  # send to translate
    "def": {TRANSFORMER: trash},  # translate special case
}

TRANSLATION_MAP = {
    "etymology_data": {
        TRANSFORMER: transform_etym_data,
        DESTINATION: ETYMOLOGY,
    },
    "commentary": {
        TRANSFORMER: noop,
        DESTINATION: COMMENTARY,
    },
    "sitelen_pona_etymology": {
        TRANSFORMER: noop,
        DESTINATION: SP_ETYMOLOGY,
    },
}


def write_translated(
    data: dict,
    dir: str,
    filename: str,
    schema: str = "../../schema/generated/word.json",
):
    for lang, d in data.items():
        d["$schema"] = schema
        os.makedirs(f"{dir}/{lang}", exist_ok=True)
        with open(f"{dir}/{lang}/{filename}", "w") as f:
            tomlified = tomlkit.dumps(d, sort_keys=True)
            tomlified = f"#:schema {schema}\n\n" + tomlified
            f.write(tomlified)


def main():
    os.makedirs("../translations", exist_ok=True)
    os.makedirs("../words", exist_ok=True)

    with open(JASIMA_DATA, "r") as f:
        jasima = json.loads(f.read())
        langs = jasima["languages"]
        data = jasima["data"]

    for word in data.keys():
        for field in TRANSFORM_MAP.keys():
            fetched = data[word].get(field)
            formatted = TRANSFORM_MAP[field][TRANSFORMER](word, fetched)
            if formatted is not None:
                write_to = TRANSFORM_MAP[field][DESTINATION]
                write_to[word][field] = formatted

            # if field == "ucsur":
            #     codepoint = data[word].get("ucsur")
            #     character = ""
            #     if codepoint:
            #         character = chr(int(codepoint[2:], base=16))
            #     words[word]["ucsur_codepoint"] = codepoint
            #     words[word]["ucsur_character"] = character
            #     continue

        for lang in langs.keys():
            DEFINITIONS[lang][word] = data[word]["def"].get(lang) or ""
            for field in TRANSLATION_MAP:
                fetched = data[word].get(field)
                formatted = TRANSLATION_MAP[field][TRANSFORMER](word, fetched)

                # TODO: key-aware transform

                if formatted is not None:
                    write_to = TRANSLATION_MAP[field][DESTINATION]
                    if field == "etymology_data":
                        untransable = formatted[1] if formatted else []
                        formatted = formatted[0] if formatted else []
                        field = "etymology"
                        WORDS[word][field] = untransable
                    write_to[lang][word] = formatted

    # TODO: order keys freely instead of alphabetically
    # or crowdin will solve this for us
    for word, worddata in WORDS.items():
        worddata["representations"] = REPRESENTATIONS[word]
        with open(f"../words/metadata/{word}.toml", "w") as f:
            tomlified = tomlkit.dumps(worddata, sort_keys=True)
            tomlified = "#:schema ../../schemas/generated/word.json\n" + tomlified
            f.write(tomlified)

    # write_translated(
    #     DEFINITIONS,
    #     "../translations",
    #     "definitions.toml",
    #     schema="../../schemas/generated/definition_translation.json",
    # )
    # write_translated(
    #     COMMENTARY,
    #     "../translations",
    #     "commentary.toml",
    #     schema="../../schemas/generated/commentary_translation.json",
    # )
    write_translated(
        ETYMOLOGY,
        "../words/translations",
        "etymology.toml",
        schema="../../schemas/generated/etymology_translation.json",
    )
    # write_translated(
    #     SP_ETYMOLOGY,
    #     "../translations",
    #     "sp_etymology.toml",
    #     schema="../../schemas/generated/sitelen_pona_translation.json",
    # )


if __name__ == "__main__":
    main()
