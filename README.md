# sona

<div align="center">
  <a href="https://discord.gg/A3ZPqnHHsy">
    <img src="https://img.shields.io/badge/-Discord-%237289da?style=for-the-badge&logo=appveyor">
  </a>
</div>

## How to Contribute?

but steps for everyone, including pre-reqs of validation which will only produce changes if the inputs are changed, and will have static outputs otherwise

1. in `./api`, `pnpm run generate` (makes json schemas from zod schemas)
2. in `./`, `pnpm dlx @taplo/cli check` (type checks all toml files using aforementioned json schemas)
3. in `./`, `python ./.github/workflows/validate_refs.py` (checks that references between types are valid)
4. in `./`, `python ./.github/workflows/package_data.py` (copies all toml data to json)
5. in `./api`, `bash ../.github/workflows/validate_generated_json.sh` (checks typing of all json files)

```
cd api && pnpm run generate && cd .. && pnpm dlx @taplo/cli check && python ./.github/workflows/validate_refs.py && python ./.github/workflows/package_data.py && cd api && bash ../.github/workflows/validate_gene rated_json.sh
```

and separately there is

- in `./`, `python ./.github/workflows/upsync_translations.py` (synchronize translation files of all types with their source; adds missing keys, overwrites empty keys, deletes spare keys in the translation)

and then helpers:

- in `./`, `python ./.github/workflows/update_schemas.py` (correct the schema line of any type-checked tomls)

## Changes in API from v1 to v2

### General

- New endpoint `/v2/glyphs` which serves sitelen pona glyph metadata
- New endpoint `/v2/sandbox/glyphs` which serves sitelen pona sandbox glyph
  metadata
- New endpoint `/v2/sandbox/words` which serves toki pona word metadata, previously `/v1/sandbox`
- Languages may only be served one at a time via a single `lang` URL parameter

### /v1/words -> /v2/words and /v1/sandbox -> /v2/sandbox/words

- Translation strings are now under `translations` -> `[field]` rather than
  `translations` -> `[langcode]` -> `[field]`
  - Key `translations` contains `definition`, `etymology`, `commentary`
  - Key `sp_etymology` moved to corresponding sitelen pona glyph
  - Root key `etymology` and translation key `etymology` merged into single
    translatable field `etymlogy` under `translations`
- Key `author_verbatim_source` renamed `author_source`
- New key `glyph_ids` which refers to all glyphs in Linku that may represent
  this word
- New key `primary_glyph_id` which refers to the glyph in Linku most used to write
  this word, such as `akesi-2` for `akesi`

- Referential fields such as `see_also` can no longer refer to sandbox data

### /v2/glyphs and /v2/sandbox/glyphs

- Key `word` refers to the latin script word this glyph writes
- Key `word_id` refers to a corresponding word in Linku by its id, which is
  often the same as `word` anyway
- Key `usage_category` functions as in `/v1/words` and `/v2/words`
- Key `primary` indicates whether a glyph is primarily used to write its word;
  must match that word's `primary_glyph_id` field
- Key `deprecated` indicates whether a glyph is considered deprecated by its creator
- Key `usage` functions as in `/v1/words` and `/v2/words`
- Key `translations` contains `etymology`, `commentary`, and an array `names`

## Changes in repo from v1 to v2

### Metadata

- `api/raw` is now split into `v1` and `v2`, which have the respective packaged
  data from Linku taken from `words/`, `luka_pona/`, `fonts/`, `languages/`, and `glyphs/` for `v2`.
- `sandbox` is now nested as `sandbox/words` and `sandbox/glyphs`
- `languages` is now split among all languages rather than having a single file,
for parity with other types

### Types

- `src/lib` is now split into `v1` and `v2`, which have the respective type
  definitions for each API.
- `api/generated` is now split into `v1` and `v2`, which have the respective
  JSON schema type definitions for each API created from the type definitions in
  `src/lib`.

### Supporting Scripts

- New and updated scripts all in `./.github/workflows/`
- `update_schemas.py`: Update the schemas of every outstanding toml data file so
  they can be properly checked by taplo
- `upsync_translations.py`: Sync keys from a source file to all translation
  files, overwriting empty keys and removing spare keys in the destination
- `validate_refs.py`: Check referential data in all data files to confirm
  correctness (e.g. main data sources do not refer to sandbox)
- `fetch_langs.py`: Now fetches individual language files

### Other

- We are no longer updating data for `v1` of the Linku API, because the TOML files
  that make up our "database" have changed in an incompatible way.
- We are also no longer updating our type definitions for `v1` of the Linku API.
  These are still possible to update, though there is no longer any reason to.
  This means `src/lib/v1` and `api/generated/v1` will be static from now on.

## Overview

sona is a collaborative, open dataset for and by the toki pona community.
It is the successor of [jasima](https://github.com/lipu-linku/jasima), and aims to replace it.
If you are looking for the data from jasima, [see here](https://linku.la/jasima/data.json). Note it is no longer being updated.

## Directories

### Editable

- `words` is word data that does not require translation, such as year of creation, author, and ku data.
  - `[word].toml`: Each specific word file, identified by name and an optional number for later coinings of the same name.
- `lukapona` is sign data that does not require translation, such as glosses, signwriting, and reference videos.
  - `[gloss].toml`: Each specific sign file, identified by its gloss.
- `source`: The original English for all translatable data.
  - `definitions.toml`: Word definitions.
  - `commentary.toml`: Relevant context and nuance about a word.
  - `etymology.toml`: The source word or words, their languages, and their definitions for a given toki pona word.
  - `sp_etymology.toml`: The source symbol or symbols for a given sitelen pona glyph.
  - `lukapona_icons.toml`: A description of a given sign by what it represents.
  - `lukapona_parameters.toml`: A set of descriptions for how to form a given sign. Note: `handshape` is here but does not translate.
- `schemas`
  - `src`
    - `index.ts`: Static descriptions and validators for each type of data in this repo.
    - `utils.ts`: Commonly used functions in `index.ts`.

### Automated

- `translations`: Translated fields from `source`, automatically sent from Crowdin.
  - `[langcode]`: Each langcode directory has the same files as `source`.
- `raw`: All data from all toml files assembled into a JSON blob.
- `schemas`
  - `generated`: Generated descriptions of the expected format of each TOML file in the repo.

## Contributing

## Translating

Please visit our [Crowdin project](https://linku.crowdin.com) to contribute translations.

## Dictionary Data and Fonts

<div align="center">
  <a href="https://github.com/lipu-linku/sona/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=lipu-linku/sona" />
  </a>
</div>

Contributing other kinds of metadata is simple:

To add new fonts to sona, please fork the repo, edit the [fonts.toml](/fonts.toml) file, and submit
a pull request. Examples of various existing fonts can be found in the file.

To edit information about Toki Pona words or Luka Pona signs, please fork the repo, edit the [words.toml](/words.toml) file, and [submit a pull request](https://github.com/lipu-linku/pull/new/)

## License

sona Linku is dual-licensed under:

- Creative Commons Attribution-ShareAlike 3.0 Unported;

- Creative Commons Attribution-ShareAlike 4.0 International.

(Dual-licensing was done to avoid any potential online encyclopedia issues).
