#!/usr/bin/env bash

log_messages=$(git log origin/master...HEAD --format=%s)

if [[ ${log_messages} =~ \bMAJOR\b ]]; then
    echo "Major Release"
#    release-it major -n --no-npm.publish --github.release --github.assets=build/database.sqlite
elif [[ ${log_messages} =~ \bMINOR\b ]]; then
    echo "Minor Release"
#    release-it major -n --no-npm.publish --github.release --github.assets=build/database.sqlite
else
    echo "Patch Release"
#    release-it patch -n --no-npm.publish --github.release --github.assets=build/database.sqlite
fi
