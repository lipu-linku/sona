# Read *.toml in the current directory.
from pathlib import Path
import tomllib

import pandas as pd


metadata_dir = Path(__file__).parent / "metadata"
files = sorted(metadata_dir.glob("*.toml"))


# Put each object in a list.
languages = []
for file in files:
    language = tomllib.loads(file.read_text(encoding="utf-8"))
    names = language.pop("name")
    languages.append({**language, **names})


# Create from it a Pandas dataframe with columns [id,direction,locale,en,tok,endonym].
columns = ["id", "direction", "locale", "en", "tok", "endonym"]
dataframe = pd.DataFrame(languages, columns=columns)


# Save to languages.csv.
dataframe.to_csv(Path(__file__).parent / "languages.csv", index=False)


# Manually sanity check that languages.csv is filled.
