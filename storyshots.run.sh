#!/bin/bash

pnpm exec playwright test --config=/storyshots/playwright.config.findStories.ts
pnpm exec playwright test --config=/storyshots/playwright.config.storyshots.ts
