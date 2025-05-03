import json
import os
import urllib.request
from pathlib import Path

import tomlkit
from langcodes import Language, LanguageTagError

CROWDIN_TOKEN = os.environ["CROWDIN_TOKEN"]
HEADERS = {"Authorization": f"Bearer {CROWDIN_TOKEN}"}

CROWDIN_PROJECT = "https://linku.crowdin.com/api/v2/projects/2"
LANG_DIR = Path("languages/metadata")


def deep_merge(parent: dict, child: dict):
    """Merge the keys of a child dictionary into a parent dictionary.
    Does not overwrite existing keys on the parent."""
    for key in child:
        if key not in parent:
            parent[key] = child[key]
            continue
        if isinstance(parent[key], dict) and isinstance(child[key], dict):
            deep_merge(parent[key], child[key])


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    resp = urllib.request.urlopen(req).read()
    return resp


def resolve_id(lang: dict, mappings: dict):
    id, twoletter, threeletter = (
        lang["id"],
        lang["twoLettersCode"],
        lang["threeLettersCode"],
    )
    if id in mappings:
        twoletter = mappings[id]["two_letters_code"]
    return twoletter


def fetch_endonym(lang_id: str) -> str | None:
    try:
        lang = Language.get(lang_id)
        name = lang.display_name(lang_id)
        name_en = lang.display_name("en")
    except LanguageTagError:
        return None

    if lang.startswith("Unknown"):
        return None
    if name == name_en:
        return None
    return name


def main():
    known_langs = {}
    for file in LANG_DIR.glob("*.toml"):
        with file.open("r", encoding="utf-8") as f:
            data = tomlkit.loads(f.read())
            lang_id = data["id"]
            assert lang_id == file.stem, f"Lang {file.name} has wrong lang_id {lang_id}"
            known_langs[lang_id] = data

    project_data = json.loads(download(CROWDIN_PROJECT))["data"]
    mappings = project_data["languageMapping"]

    for lang in project_data["targetLanguages"]:
        lang_id = resolve_id(lang, mappings)
        endonym = fetch_endonym(lang_id)
        filtered_lang = {
            "id": lang_id,
            "locale": lang["locale"],
            "direction": lang["textDirection"],
            "name": {  # `tok` not available, must be added later
                "en": lang["name"],
            },
        }
        if endonym:
            filtered_lang["name"]["endonym"] = endonym

        if lang_id in known_langs:
            print(f"Merging language {lang_id}")
            deep_merge(known_langs[lang_id], filtered_lang)
            continue
        print(f"Adding language {lang_id}")
        known_langs[lang_id] = filtered_lang

    for lang_id, data in known_langs.items():
        file = LANG_DIR / f"{lang_id}.toml"
        with file.open("w", encoding="utf-8") as f:
            # stable if no changes were made
            f.write(tomlkit.dumps(data, sort_keys=True))


if __name__ == "__main__":
    main()
