# sona

<div align="center">
  <a href="https://discord.gg/A3ZPqnHHsy">
    <img src="https://img.shields.io/badge/-Discord-%237289da?style=for-the-badge&logo=appveyor">
  </a>
</div>

## Changes from v1 to v2

### API

- `src/server` is now split into `v1` and `v2`, which have the respective
  endpoint definitions for each API.
- The api endpoint `/v2/glyphs` now exists and delivers glyph metadata.
- `v2` can only receive requests for one language at a time.

### API Types

Mostly affecting v2:

- The `translations` key now has static child keys for each type, rather than an
  intermediate and variable langcode key.
- The nightmarish `etymology` key of `words` is now a single translatable string rather than
  two parallel arrays in two different locations.
- `words` now have metadata indicating their corresponding glyph or glyphs:
  `glyph_ids`, `synonym_glyph_ids`, and `primary_glyph_id`

### Metadata

- `api/raw` is now split into `v1` and `v2`, which have the respective packaged
  data from Linku taken from `words/`, `luka_pona/`, `fonts/`, `languages/`, and `glyphs/` for `v2`.
-

### Types

- `src/lib` is now split into `v1` and `v2`, which have the respective type
  definitions for each API.
- `api/generated` is now split into `v1` and `v2`, which have the respective
  JSON schema type definitions for each API created from the type definitions in
  `src/lib`.

### Supporting Scripts

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
