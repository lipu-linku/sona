# sona

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

Contributing other kinds of metadata is simple:

To add new fonts to sona, please fork the repo, edit the [fonts.toml](/fonts.toml) file, and submit
a pull request. Examples of various existing fonts can be found in the file.

To edit information about Toki Pona words or Luka Pona signs, please fork the repo, edit the [words.toml](/words.toml) file, and [submit a pull request](https://github.com/lipu-linku/pull/new/)
