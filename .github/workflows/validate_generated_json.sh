#!/bin/bash -e

declare -A schema_map=(
	["words.json"]="words_data.json"
	["glyphs.json"]="glyphs_data.json"
	["sandbox/words.json"]="words_data.json"
	["sandbox/glyphs.json"]="glyphs_data.json"
	["luka_pona/signs.json"]="signs_data.json"
	["luka_pona/fingerspellings.json"]="fingerspellings_data.json"
	["fonts.json"]="fonts.json"
	["languages.json"]="languages.json"
)

get_schema() {
	local relative="$1"

	if [[ -n "${schema_map[$relative]}" ]]; then
		echo "${schema_map[$relative]}"
		return
	fi

	if [[ "$relative" =~ ^translations/[^/]+/words\.json$ ]]; then
		echo "word_translations.json"
	elif [[ "$relative" =~ ^translations/[^/]+/glyphs\.json$ ]]; then
		echo "glyph_translations.json"
	elif [[ "$relative" =~ ^sandbox/translations/[^/]+/words\.json$ ]]; then
		echo "word_translations.json"
	elif [[ "$relative" =~ ^sandbox/translations/[^/]+/glyphs\.json$ ]]; then
		echo "glyph_translations.json"
	elif [[ "$relative" =~ ^translations/luka_pona/[^/]+/signs\.json$ ]]; then
		echo "sign_translations.json"
	elif [[ "$relative" =~ ^translations/luka_pona/[^/]+/fingerspellings\.json$ ]]; then
		echo "fingerspelling_translations.json"
	else
		echo ""
	fi
}

while IFS= read -r -d '' file; do
	relative="${file#./raw/v2/}"
	schema="$(get_schema "$relative")"

	if [[ -z "$schema" ]]; then
		echo "⚠️  No schema found for: $relative"
		continue
	fi

	npx ajv-cli -s "./generated/v2/$schema" -c ajv-formats --all-errors --errors=text -d "$file"
done < <(find ./raw/v2 -type f -name '*.json' -print0)
