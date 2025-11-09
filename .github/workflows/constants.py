from typing import Callable, Final, Literal, NotRequired, TypedDict

DATA_FOLDER: Final[str] = "metadata"
TRANSLATIONS_FOLDER: Final[str] = "translations"
CURRENT_API_VERSION = "v2"

Packager = Callable[[str, str, str], None]


class Refs(TypedDict):
    key: str
    to: list[str]


class DataToPackage(TypedDict):
    input: str
    output: str
    type: Literal["data", "locales"]
    schema: NotRequired[str]
    translations: NotRequired[str]
    source: NotRequired[str]
    refs: NotRequired[list[Refs]]


DATA: dict[str, DataToPackage] = {
    "words": {
        "input": "words/metadata/{id}.toml",
        "output": "words.json",
        "type": "data",
        "schema": "word.json",
        "translations": "words_locale",
        "refs": [
            {"key": "parent_id", "to": ["words"]},
            {"key": "see_also", "to": ["words"]},
            {"key": "glyph_ids", "to": ["glyphs"]},
            {"key": "primary_glyph_id", "to": ["glyphs"]},
            {"key": "synonym_glyph_ids", "to": ["glyphs"]},
        ],
    },
    "glyphs": {
        "input": "glyphs/metadata/{id}.toml",
        "output": "glyphs.json",
        "type": "data",
        "schema": "glyph.json",
        "translations": "glyphs_locale",
        "refs": [
            {"key": "word_id", "to": ["words"]},
            {"key": "parent_id", "to": ["glyphs"]},
        ],
    },
    "sandbox_words": {
        "input": "sandbox/words/metadata/{id}.toml",
        "output": "sandbox/words.json",
        "type": "data",
        "schema": "word.json",
        "translations": "sandbox_words_locale",
        "refs": [
            # TODO: sandbox words can ref words...
            {"key": "see_also", "to": ["words", "sandbox_words"]},
            {"key": "glyph_ids", "to": ["sandbox_glyphs", "glyphs"]},
            # {"key": "primary_glyph_id", "to": ["sandbox_glyphs", "glyphs"]},
            # primary_glyph_id is nullable in sandbox_words
            {"key": "synonym_glyph_ids", "to": ["sandbox_glyphs", "glyphs"]},
        ],
    },
    "sandbox_glyphs": {
        "input": "sandbox/glyphs/metadata/{id}.toml",
        "output": "sandbox/glyphs.json",
        "type": "data",
        "schema": "glyph.json",
        "translations": "sandbox_glyphs_locale",
        "refs": [
            {"key": "word_id", "to": ["words", "sandbox_words"]},
        ],
    },
    "lp_signs": {
        "input": "luka_pona/signs/metadata/{id}.toml",
        "output": "luka_pona/signs.json",
        "type": "data",
        "schema": "sign.json",
        "translations": "lp_signs_locale",
        "refs": [],
    },
    "lp_fingerspelling": {
        "input": "luka_pona/fingerspelling/metadata/{id}.toml",
        "output": "luka_pona/fingerspellings.json",
        "type": "data",
        "schema": "fingerspelling.json",
        "translations": "lp_fingerspelling_locale",
        "refs": [],
    },
    "fonts": {
        "input": "fonts/metadata/{id}.toml",
        "output": "fonts.json",
        "type": "data",
        "schema": "font.json",
        # no translations so no data distinction or change between toml/json/api
    },
    "languages": {
        "input": "languages/metadata/{id}.toml",
        "output": "languages.json",
        "type": "data",
        "schema": "language.json",
    },
    ###
    ###
    ###
    "words_locale": {
        "input": "words/translations/{langcode}/{id}.toml",
        "output": "translations/{langcode}/words.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "words/source/{id}.toml",
    },
    "glyphs_locale": {
        "input": "glyphs/translations/{langcode}/{id}.toml",
        "output": "translations/{langcode}/glyphs.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "glyphs/source/{id}.toml",
    },
    "sandbox_words_locale": {
        "input": "sandbox/words/translations/{langcode}/{id}.toml",
        "output": "sandbox/translations/{langcode}/words.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "sandbox/words/source/{id}.toml",
    },
    "sandbox_glyphs_locale": {
        "input": "sandbox/glyphs/translations/{langcode}/{id}.toml",
        "output": "sandbox/translations/{langcode}/glyphs.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "sandbox/glyphs/source/{id}.toml",
    },
    "lp_signs_locale": {
        "input": "luka_pona/signs/translations/{langcode}/{id}.toml",
        "output": "luka_pona/translations/{langcode}/signs.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "luka_pona/signs/source/{id}.toml",
    },
    "lp_fingerspelling_locale": {
        "input": "luka_pona/fingerspelling/translations/{langcode}/{id}.toml",
        "output": "luka_pona/translations/{langcode}/fingerspellings.json",
        "type": "locales",
        # "schema": "{id}.json",
        "source": "luka_pona/fingerspelling/source/{id}.toml",
    },
}
