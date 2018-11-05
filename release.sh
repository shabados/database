#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

log_messages=$(git log $(git describe --tags --abbrev=0)...HEAD --format=%B)
major_re=\#Major
minor_re=\#Minor
patch_re=\#Patch

echo ${log_messages}

args="-n --npm.access=public --github.release --no-requireCleanWorkingDir"

if [[ ${log_messages} =~ ${major_re}  ]]; then
    echo "Major Release"
    release-it major ${args}
elif [[ ${log_messages} =~ ${minor_re} ]]; then
    echo "Minor Release"
    release-it minor ${args}
elif [[ ${log_messages} =~ ${patch_re} ]]; then
    echo "Patch Release"
    release-it patch ${args}
else
    echo "Not releasing"
fi
