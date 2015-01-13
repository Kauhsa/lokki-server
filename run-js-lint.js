#!/bin/bash

# Try to detect if 'find' is GNU or BSD version. BSD version doesn't support
# '--version' flag, so if 'find' looks like a BSD version, let's pray that GNU
# find is installed to command 'gfind'.
if find --version >/dev/null 2>&1 ; then
    find_cmd=find
else
    find_cmd=gfind
fi

$find_cmd . -path ./node_modules -prune -o -name "*.js" -exec gjslint {} +
