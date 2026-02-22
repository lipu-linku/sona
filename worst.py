#!/usr/bin/env python3

import sys
from pathlib import Path

import tomlkit

LANGS = ["ja", "pl", "pt", "tr"]
CONTROL_LANG = "pt"

WORDS_BASE = Path("words/translations")
GLYPHS_BASE = Path("glyphs/translations")


def load_toml(path: Path):
    if not path.exists():
        return tomlkit.document()
    with path.open("r", encoding="utf-8") as f:
        return tomlkit.parse(f.read())


def save_toml(path: Path, data):
    with path.open("w", encoding="utf-8") as f:
        f.write(tomlkit.dumps(data))


def find_matching_keys(word_key, glyph_data):
    prefix = f"{word_key}-"
    return [k for k in glyph_data.keys() if k.startswith(prefix)]


def inline_preview(value):
    text = tomlkit.dumps({"x": value})
    return text.split("=", 1)[1].strip().replace("\n", " ")


def main():
    control_words_path = WORDS_BASE / CONTROL_LANG / "sp_etymology.toml"
    control_glyphs_path = GLYPHS_BASE / CONTROL_LANG / "etymology.toml"

    control_words = load_toml(control_words_path)
    control_glyphs = load_toml(control_glyphs_path)

    selections = {}

    for word_key in sorted(control_words.keys()):
        matches = find_matching_keys(word_key, control_glyphs)

        if not matches:
            print(f"\n[SKIP] {word_key} — no glyph matches.")
            continue

        source_preview = inline_preview(control_words[word_key])

        # Auto-accept if only one match
        if len(matches) == 1:
            selections[word_key] = matches[0]
            print(f"\n[AUTO] {word_key} → {matches[0]}")
            print(f"  SOURCE: {source_preview}")
            print(f"  TARGET: {inline_preview(control_glyphs[matches[0]])}")
            continue

        print("\n" + "=" * 60)
        print(f"{word_key}")
        print(f"  SOURCE: {source_preview}")

        for i, key in enumerate(matches, start=1):
            target_preview = inline_preview(control_glyphs[key])
            print(f"  [{i}] {key}: {target_preview}")

        while True:
            choice = input("Select number (Enter to skip, q to quit): ").strip()

            if choice == "":
                break

            if choice.lower() == "q":
                print("Aborting.")
                sys.exit(0)

            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(matches):
                    selections[word_key] = matches[idx]
                    break

            print("Invalid selection.")

    print("\nSelections complete.")
    print("Applying changes...")

    for lang in LANGS:
        words_path = WORDS_BASE / lang / "sp_etymology.toml"
        glyphs_path = GLYPHS_BASE / lang / "etymology.toml"

        words_data = load_toml(words_path)
        glyphs_data = load_toml(glyphs_path)

        changed = False

        for word_key, glyph_key in selections.items():
            if word_key not in words_data:
                continue
            if glyph_key not in glyphs_data:
                continue

            glyphs_data[glyph_key] = words_data[word_key]
            changed = True

        if changed:
            save_toml(glyphs_path, glyphs_data)
            print(f"Updated {glyphs_path}")
        else:
            print(f"No changes for {glyphs_path}")

    print("Done.")


if __name__ == "__main__":
    main()
