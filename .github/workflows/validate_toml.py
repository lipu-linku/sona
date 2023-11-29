from glob import iglob
import tomllib
from jsonschema import validate
import json

if __name__ == "__main__":
  for path in iglob("../../**/*.toml", recursive=True):
    with open(path, 'rb') as file:
      try:
        print(f"Checking {file.name}...")
        data = tomllib.load(file)
        
        if "translations" in path:
          with open("../../schemas/translation.schema.json") as schema:
            print(f"Checking translation schema for {file.name}...")
            validate(data, json.load(schema))
      except tomllib.TOMLDecodeError as e:
        print(e)