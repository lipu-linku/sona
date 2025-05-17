import re
from pathlib import Path

DATA_TYPES = [
    "languages",
    "fonts",
    "words",
    "glyphs",
    "sandbox/words",
    "sandbox/glyphs",
    "luka_pona/signs",
    "luka_pona/fingerspelling",
]

SCHEMA_LINE_REGEX = re.compile(r"^#:schema .+$", re.MULTILINE)


def make_singular(plural: str) -> str:
    return plural[:-1] if plural.endswith("s") else plural


def update_or_insert_schema_line(file_path: Path, new_schema_line: str):
    content = file_path.read_text(encoding="utf-8").splitlines()

    if content and SCHEMA_LINE_REGEX.match(content[0]):
        content[0] = new_schema_line
    else:
        content.insert(0, new_schema_line)

    file_path.write_text("\n".join(content) + "\n", encoding="utf-8")


def process_directory(base_dir: str):
    typ = base_dir.split("/")[-1]
    typ = make_singular(typ)

    metadata_dir = Path(base_dir) / "metadata"
    if metadata_dir.exists():
        for toml_file in metadata_dir.glob("*.toml"):
            new_schema = f"#:schema ../../api/generated/v2/{typ}.json"
            update_or_insert_schema_line(toml_file, new_schema)

    source_dir = Path(base_dir) / "source"
    if source_dir.exists():
        for toml_file in source_dir.glob("*.toml"):
            name = toml_file.stem
            new_schema = (
                f"#:schema ../../api/generated/v2/translations/{typ}_{name}.json"
            )
            update_or_insert_schema_line(toml_file, new_schema)


def main():
    for data_type in DATA_TYPES:
        process_directory(data_type)


if __name__ == "__main__":
    main()
