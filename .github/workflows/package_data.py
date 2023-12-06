from typing import Any
import tomlkit
import json
import glob
import os
import sys
import urllib.parse

if __name__ == "__main__":
    assert len(sys.argv) == 2

    result: dict[str, Any] = {}

    for path in glob.iglob("./words/*.toml"):
        with open(path) as file:
            print(f"Reading {path}...")
            word_data = tomlkit.load(file)
            id = os.path.basename(path[: path.index(".toml")])

            result[id] = {
                key: value
                for (key, value) in dict(word_data).items()
                if key != "$schema"
            }
            result[id]["translations"] = {}

    for path in glob.iglob("./translations/*/*.toml"):
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            data_kind = os.path.basename(path[: path.index(".toml")])

            for word in (word for word in localized_data.keys() if word != "$schema"):
                result[word]["translations"][data_kind] = localized_data[word]

    with open("raw/data.json", "w+") as data_file:
        result[
            "$schema"
        ] = f"https://raw.githubusercontent.com/lipu-linku/sona/{urllib.parse.quote(sys.argv[1])}/schemas/generated/data.json"
        data_file.write(json.dumps(result, separators=(',', ':')))

    print("Done!")
