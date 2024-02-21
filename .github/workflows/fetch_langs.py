import json
import os
import urllib.request

import tomlkit

CROWDIN_TOKEN = os.environ["CROWDIN_TOKEN"]
HEADERS = {"Authorization": f"Bearer {CROWDIN_TOKEN}"}

CROWDIN_PROJECT = "https://linku.crowdin.com/api/v2/projects/2"


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


def main():
    with open("languages/metadata/languages.toml", "r+") as f:
        known_langs = tomlkit.loads(f.read())
        project_data = json.loads(download(CROWDIN_PROJECT))["data"]
        mappings = project_data["languageMapping"]

        for lang in project_data["targetLanguages"]:
            lang_id = resolve_id(lang, mappings)
            filtered_lang = {
                "id": lang_id,
                "locale": lang["locale"],
                "direction": lang["textDirection"],
                "name": {  # no endonym or `tok` available, must be added later
                    "en": lang["name"],
                },
            }

            if lang_id in known_langs:
                print(f"Merging language {lang_id}")
                deep_merge(known_langs[lang_id], filtered_lang)
                continue
            print(f"Adding language {lang_id}")
            known_langs[lang_id] = filtered_lang

        f.truncate(0)
        f.seek(0)
        f.write(tomlkit.dumps(known_langs))


if __name__ == "__main__":
    main()
