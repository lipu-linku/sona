#!/bin/bash

find . -type f -name "definitions.toml" | while read -r file; do
	dir=$(dirname "$file")
	git mv "$file" "$dir/definition.toml"
done
