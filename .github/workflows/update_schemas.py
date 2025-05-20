import os
import re
import sys
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(SCRIPT_DIR)

from constants import DATA, DataToPackage
from utils import find_files, get_path_values, get_unbound_param

SCHEMA_LINE_RE = re.compile(r"^#:schema .+$", re.MULTILINE)


def insert_or_update_schema_line(file_path: Path, schema_line: str):
    content = file_path.read_text(encoding="utf-8").splitlines()
    if content and SCHEMA_LINE_RE.match(content[0]):
        content[0] = schema_line
    else:
        content.insert(0, schema_line)
    file_path.write_text("\n".join(content) + "\n", encoding="utf-8")


def resolve_schema(schema_template: str, path: Path, input: str, output: str) -> str:
    if "{" in schema_template:
        param = get_unbound_param(schema_template, output)
        values = get_path_values(input, str(path))
        return schema_template.format(**values)
    return schema_template


def update_schemas(entry: DataToPackage):
    key = "input" if entry["type"] == "data" else "source"
    input = entry[key]
    output = entry["output"]
    schema_template = entry["schema"]
    for path in find_files(input):
        resolved_schema = resolve_schema(schema_template, path, input, output)
        insert_or_update_schema_line(
            path, f"#:schema ../../api/generated/v2/{resolved_schema}"
        )


def main():
    for config in DATA.values():
        update_schemas(config)


if __name__ == "__main__":
    main()
