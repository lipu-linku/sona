import os
import sys

# this lets you import from files in the same dir
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import CURRENT_API_VERSION, DATA
from utils import PACKAGE_MAP


def main():
    for id, metadata in DATA.items():
        input = metadata["input"]
        output = metadata["output"]
        typ = metadata["type"]
        packager = PACKAGE_MAP[typ]
        packager(f"api/src/raw/{CURRENT_API_VERSION}/", input, output)

    print("Done!")


if __name__ == "__main__":
    main()
