import json
import os
import urllib.request

import tomlkit

CROWDIN_TOKEN = os.environ["CROWDIN_TOKEN"]
HEADERS = {"Authorization": f"Bearer {CROWDIN_TOKEN}"}

CROWDIN_PROJECT = "https://linku.crowdin.com/api/v2/projects/2"


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
        current_data = tomlkit.loads(f.read())
        crowdin_data = json.loads(download(CROWDIN_PROJECT))["data"]
        mappings = crowdin_data["languageMapping"]

        has_changes = False

        for lang in crowdin_data["targetLanguages"]:
            lang_id = resolve_id(lang, mappings)
            if lang_id in current_data:
                continue
            print(f"Adding lang {lang_id}")
            current_data[lang_id] = {
                "locale": lang["locale"],
                "name": {
                    "en": lang["name"],
                },
            }
            has_changes = True

        if has_changes:
            f.truncate(0)
            f.seek(0)
            f.write(tomlkit.dumps(current_data, sort_keys=True))


if __name__ == "__main__":
    main()
