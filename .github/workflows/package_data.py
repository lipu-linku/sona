import glob
import json
import os
from typing import Any

import tomlkit

if __name__ == "__main__":
    result: dict[str, Any] = {}

    for path in glob.iglob("./words/*.toml"):
        with open(path) as file:
            print(f"Reading {path}...")
            word_data = tomlkit.load(file)
            id = os.path.basename(path[: path.index(".toml")])

            result[id] = {key: value for (key, value) in dict(word_data).items()}
            result[id]["translations"] = {}

    for path in glob.iglob("./translations/*/*.toml"):
        with open(path) as file:
            print(f"Reading {path}...")
            localized_data = tomlkit.load(file)
            locale = os.path.dirname(path)[path.rfind("/", 0, path.rfind("/")) + 1 :]
            data_kind = os.path.basename(path[: path.index(".toml")])

            for word in {word for word in localized_data.keys()}:
                if locale not in result[word]["translations"]:
                    result[word]["translations"][locale] = {}

                result[word]["translations"][locale][data_kind] = localized_data[word]

    with open("raw/data.json", "w+") as data_file:
        data_file.write(json.dumps(result, separators=(",", ":")))

    print("Done!")
