# Storybook Storyshots

Visual regression tests are a useful way to maintain consistency for UI elements. The idea is to create "baselines" that best represent your UI elements, and then expect that code changes never deviate from this baseline, unless explicitly told to do so. While there are ways of doing this with Jest matchers, our approach creates screenshot baselines of UI elements from a built Storybook. This ensures that Storyshot stories either maintain their existing baseline, or confirm that they've been updated.

## How to include

We recommend using Batect in order to include this in your project. Batect offers a clean way of spinning up both a Storybook server from your built Storybook components, as well as the headless browser container that creates the screenshots. Additionally, the container ensures consistency in browser representation of your components to avoid small cross-device differences of text size or pixel densities.
 
To include in a `batect.yml`, you need to add the following block:
```yml
include:
  - type: git
    repo: git@github.com:compoze-labs/storyshots.git
    ref: 0.3.0
```
 
Once included, you will now have access to two tasks: `./batect storyshots` and `./batect storyshots-update`. However, these two commands will also need to know where to find your pre-built Storybook directory.
```bash
# pre-build storybook task usually comes for free from storybook in your package.json
npm run build-storybook

# create first-time baselines
STORYSHOTS_RESULTS_DIR=./ STORYBOOK_STATIC_DIR=./storybook-static ./batect storyshots-update
```