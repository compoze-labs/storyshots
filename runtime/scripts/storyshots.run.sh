#!/bin/bash

# Run the logger in the background
pnpm runtime:logs-server &

if [ -z "$DEBUG" ]; then
    pnpm --silent runtime:findStories
    pnpm --silent runtime:start
else
    echo "Debug mode"
    pnpm runtime:findStories:debug
    pnpm runtime:start:debug
fi
