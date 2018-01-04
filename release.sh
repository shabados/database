#!/usr/bin/env bash

log_messages=$(git log origin/master...HEAD --format=%s)
major_re=\\bMAJOR\\b
minor_re=\\bMINOR\\b

echo ${log_messages}

if [[ ${log_messages} =~ ${major_re}  ]]; then
    echo "Major Release"
    release-it major -n --github.release --github.assets=build/database.sqlite
elif [[ ${log_messages} =~ ${minor_re} ]]; then
    echo "Minor Release"
    release-it minor -n --github.release --github.assets=build/database.sqlite
else
    echo "Patch Release"
    release-it patch -n --github.release --github.assets=build/database.sqlite
fi
