#!/bin/bash -e

declare -A schema_map=(
	["words.json"]="words.json"
	["glyphs.json"]="glyphs.json"
	["sandbox/words.json"]="words.json"
	["sandbox/glyphs.json"]="glyphs.json"
	["luka_pona/signs.json"]="signs.json"
	["luka_pona/fingerspellings.json"]="fingerspellings.json"
	["fonts.json"]="fonts.json"
	["languages.json"]="languages.json"
)

get_schema() {
	local relative="$1"

	if [[ -n "${schema_map[$relative]}" ]]; then
		echo "${schema_map[$relative]}"
		return
	fi
  echo ""

	# if [[ "$relative" =~ ^translations/[^/]+/words\.json$ ]]; then
	# 	echo "word_translations.json"
	# elif [[ "$relative" =~ ^translations/[^/]+/glyphs\.json$ ]]; then
	# 	echo "glyph_translations.json"
	# elif [[ "$relative" =~ ^sandbox/translations/[^/]+/words\.json$ ]]; then
	# 	echo "word_translations.json"
	# elif [[ "$relative" =~ ^sandbox/translations/[^/]+/glyphs\.json$ ]]; then
	# 	echo "glyph_translations.json"
	# elif [[ "$relative" =~ ^luka_pona/translations/[^/]+/signs\.json$ ]]; then
	# 	echo "sign_translations.json"
	# elif [[ "$relative" =~ ^luka_pona/translations/[^/]+/fingerspellings\.json$ ]]; then
	# 	echo "fingerspelling_translations.json"
	# else
	# 	echo ""
	# fi
}

while IFS= read -r -d '' file; do
	relative="${file#./src/raw/v2/}"
	schema="$(get_schema "$relative")"

	if [[ -z "$schema" ]]; then
		echo "⚠️  No schema found for: $relative"
		continue
	fi

  # due to a bug in ajv-cli, you must specify the spec for draft2020
  # and, due to their badly chosen default and that they do not inspect the given schema, you must turn off strict
	npx ajv-cli -s "./generated/v2/$schema" -c ajv-formats --spec=draft2020 --all-errors --errors=text --strict=false -d "$file"
done < <(find ./src/raw/v2 -type d -name translations -prune -o -type f -name '*.json' -print0)
