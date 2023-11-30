from glob import iglob
import tomllib
from jsonschema import validate, Draft7Validator, ValidationError
import json
import sys

sys.tracebacklimit = 0

if __name__ == "__main__":
    for path in iglob("../../**/*.toml", recursive=True):
        with open(path, "rb") as file:
            try:
                print(f"Checking {file.name}...")
                data = tomllib.load(file)

                if "translations" in path:
                    with open("../../schemas/translation.schema.json") as schema:
                        print(f"Checking translation schema for {file.name}...")
                        validate(
                            instance=data,
                            schema=json.load(schema),
                            format_checker=Draft7Validator.FORMAT_CHECKER,
                        )
            except tomllib.TOMLDecodeError as e:
                print(e)
