#!/bin/sh -e
list=(./api/raw/*.json)
for file in "${list[@]}"; do
    generated="$(basename "${file}")"
    if [ "$generated" == "sandbox.json" ]; then
        generated="words.json"
    fi
    npx ajv-cli -s "./api/generated/$generated" -c ajv-formats --all-errors --errors=text -d $file;
done
