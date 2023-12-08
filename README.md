# sona

sona is a collaborative, open dataset for and by the Toki Pona community.
It is the successor of [jasima](https://github.com/lipu-linku/jasima), and aims to replace it.

## Directories

- `words` is static data that does not require translation, such as the year a word was created, its author, or how it can be written.
- `source` is the original English text all our data is based on, and contains one toml per field to translate with keys for each word Linku tracks.
- `translations` is the translated text, and is automatically filled in from Crowdin.
- `schemas` is a set of validators for all data specific to each data type.

## Contributing

## Translating

Please visit our [Crowdin project](https://crowdin.com/project/kulupu-linku) to contribute
definition translations.

## Dictionary Data and Fonts

Contributing other kinds of metadata is simple:

To add new fonts to sona, please fork the repo, edit the [fonts.toml](/fonts.toml) file, and submit
a pull request. Examples of various existing fonts can be found in the file.

To edit information about Toki Pona words or Luka Pona signs, please fork the repo, edit the [words.toml](/words.toml) file, and [submit a pull request](https://github.com/lipu-linku/pull/new/)
