"""Import survey percentages into existing word metadata files."""

import argparse
import csv
import re
import tomllib
from pathlib import Path


DEFAULT_METADATA_DIR = Path(__file__).resolve().parents[2] / "words/metadata"
DEFAULT_SANDBOX_DIR = Path(__file__).resolve().parents[2] / "sandbox/words/metadata"


def updated_usage(source: str, period: str, value: int) -> str:
    lines = source.splitlines(keepends=True)
    headers = [i for i, line in enumerate(lines) if re.fullmatch(r"\[[^\]]+\]\s*", line)]
    starts = [i for i in headers if lines[i].strip() == "[usage]"]
    if len(starts) != 1:
        raise ValueError("expected exactly one [usage] section")
    start = starts[0]
    end = next((i for i in headers if i > start), len(lines))
    entry = re.compile(rf"^{re.escape(period)}\s*=")
    matches = [i for i in range(start + 1, end) if entry.match(lines[i])]
    if len(matches) > 1:
        raise ValueError(f"duplicate {period} entries")
    if matches:
        i = matches[0]
        lines[i] = f"{period} = {value}\n"
    else:
        i = end
        while i > start + 1 and not lines[i - 1].strip():
            i -= 1
        lines.insert(i, f"{period} = {value}\n")
    result = "".join(lines)
    tomllib.loads(result)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_file", type=Path)
    parser.add_argument("period", help="Survey date, for example 2026-09")
    parser.add_argument("--metadata-dir", type=Path, default=DEFAULT_METADATA_DIR)
    parser.add_argument("--sandbox-dir", type=Path, default=DEFAULT_SANDBOX_DIR)
    parser.add_argument("--skip", action="append", default=[], help="Word to omit")
    args = parser.parse_args()
    if not re.fullmatch(r"\d{4}-\d{2}", args.period):
        parser.error("period must have the form YYYY-MM")

    changes = {}
    missing = []
    skipped = []
    seen = set()
    with args.csv_file.open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ["word", "value"]:
            parser.error("CSV columns must be word,value")
        for row in reader:
            word = row["word"]
            if not re.fullmatch(r"[A-Za-z0-9_-]+", word) or word in seen:
                raise ValueError(f"invalid or duplicate word: {word!r}")
            seen.add(word)
            value = int(row["value"])
            if not 0 <= value <= 100:
                raise ValueError(f"percentage out of range for {word}: {value}")
            if word in args.skip:
                skipped.append(word)
                continue
            path = args.metadata_dir / f"{word}.toml"
            if not path.is_file():
                path = args.sandbox_dir / f"{word}.toml"
                if not path.is_file():
                    missing.append(word)
                    continue
            source = path.read_text(encoding="utf-8")
            metadata = tomllib.loads(source)
            if metadata.get("id") != word:
                raise ValueError(f"metadata ID does not match {word}: {path}")
            changes[path] = updated_usage(source, args.period, value)

    for path, content in changes.items():
        path.write_text(content, encoding="utf-8")
    print(f"Updated {len(changes)} metadata files for {args.period}.")
    print(f"Explicitly skipped: {', '.join(skipped) or 'none'}")
    print(f"No metadata file: {', '.join(missing) or 'none'}")


if __name__ == "__main__":
    main()
