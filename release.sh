#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

log_messages=$(git log -1 --format=%s)
major_re=\\bMAJOR\\b
minor_re=\\bMINOR\\b
no_re=\\bNO-RELEASE\\b

echo ${log_messages}

args="-n --npm.access=public --github.release --no-requireCleanWorkingDir --github.assets=build/database.sqlite"

if [[ ${log_messages} =~ ${major_re}  ]]; then
    echo "Major Release"
    release-it major ${args}
elif [[ ${log_messages} =~ ${minor_re} ]]; then
    echo "Minor Release"
    release-it minor ${args}
elif [[ ${log_messages} =~ ${minor_re} ]]; then
    echo "Not releasing"
else
    echo "Patch Release"
    release-it patch ${args}
fi
