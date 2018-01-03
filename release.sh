#!/usr/bin/env bash

log_messages=$(git log origin/master...HEAD --format=%s)
major_re=\\bMAJOR\\b
minor_re=\\bMINOR\\b

if [[ ${log_messages} =~ ${major_re}  ]]; then
    echo "Major Release"
    release-it major -n --no-npm.publish --github.release --github.assets=build/database.sqlite
elif [[ ${log_messages} =~ ${minor_re} ]]; then
    echo "Minor Release"
    release-it minor -n --no-npm.publish --github.release --github.assets=build/database.sqlite
else
    echo "Patch Release"
    release-it patch -n --no-npm.publish --github.release --github.assets=build/database.sqlite
fi
