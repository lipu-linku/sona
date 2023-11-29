from glob import iglob
from tomllib import load, TOMLDecodeError

if __name__ == "__main__":
  for path in iglob("../../**/*.toml", recursive=True):
    with open(path, 'rb') as file:
      try:
        print(f"Checking {file.name}...")
        load(file)
      except TOMLDecodeError as e:
        print(e)