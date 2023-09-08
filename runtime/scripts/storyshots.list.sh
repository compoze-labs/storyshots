#!/bin/bash

# Run the logger in the background
pnpm runtime:logs-server &

if [ -z "$DEBUG" ]; then
    pnpm --silent runtime:findStories:debug
else
    echo "Debug mode"
    pnpm runtime:findStories:debug
fi

