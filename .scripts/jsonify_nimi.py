#!/usr/bin/env python
import json
import os


HERE = os.getcwd()
INPUT_FILES_TXT = [
    HERE + os.sep + "nimi_pu.txt",
    HERE + os.sep + "nimi_pi_pu_ala.txt",
]

LINE_JUNK = '[]"'


def process_word(word: str) -> dict:
    # edge case: multi-word definitions (yupekosi), quotes in definition (pu)
    splits = word.split(" ")
    defin = " ".join(splits[:-1])
    score = splits[-1]
    return {defin: int(score)}


def process_definitions(defs: str) -> dict:
    cleaned_defs = {}
    for defin in defs.split(","):
        cleaned_word = process_word(defin.strip())
        cleaned_defs = {**cleaned_defs, **cleaned_word}

    return cleaned_defs


def process_line(line: str) -> dict:
    # edge case: files download in DOS format, spare whitespace, []
    if not line or line[0] == "#" or line == os.linesep:
        return {}
    word, *defs = line.split(":")
    defs = ":".join(defs).strip()
    for char in LINE_JUNK:
        defs = defs.replace(char, "")
    to_ret = {word: process_definitions(defs)}
    return to_ret


def jsonify_nimi():
    nimi = {}
    for file in INPUT_FILES_TXT:
        f = open(file, "r")
        for line in f:
            nimi.update(process_line(line))
        f.close()
    return nimi


def main():
    nimi = jsonify_nimi()
    print(json.dumps(nimi))


if __name__ == "__main__":
    main()
