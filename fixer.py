#!/usr/bin/env python3

import tomllib
from pathlib import Path

import requests
import tomlkit

BASE_URL = "http://localhost:5173/v1/words"
LANGS = ["ja", "pt", "ru"]
BASE_DIR = Path("words/translations")


def format_entry(word, alt, language, definition):
    # Build "word (alt)"
    word_part = ""
    if word:
        word_part = word
        if alt:
            word_part += f" ({alt})"

    if word_part:
        if language:
            if definition:
                return f"{word_part}: {language}, {definition}"
            return f"{word_part}: {language}"
        if definition:
            return f"{word_part}: {definition}"
        return word_part

    # No word part
    if language:
        if definition:
            return f"{language}, {definition}"
        return language

    if definition:
        return definition

    return ""


def main():
    resp = requests.get(BASE_URL)
    resp.raise_for_status()
    words_data = resp.json()

    for lang in LANGS:
        toml_path = BASE_DIR / lang / "etymology.toml"

        with toml_path.open("rb") as f:
            toml_data = tomlkit.load(f)

        new_data = {}

        for word_id, toml_records in toml_data.items():
            json_word = words_data.get(word_id, {})
            json_etymologies = json_word.get("etymology", [])

            formatted_entries = []

            for i, toml_record in enumerate(toml_records):
                json_record = json_etymologies[i] if i < len(json_etymologies) else {}

                word = json_record.get("word")
                alt = json_record.get("alt")

                language = toml_record.get("language")
                definition = toml_record.get("definition")

                entry = format_entry(word, alt, language, definition)

                if entry:
                    formatted_entries.append(entry)

            new_data[word_id] = "; ".join(formatted_entries)

        with toml_path.open("w") as f:
            data = tomlkit.dumps(new_data)
            f.write(data)

        print(f"Reformatted {toml_path}")


if __name__ == "__main__":
    main()
