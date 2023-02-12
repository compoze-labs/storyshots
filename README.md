# Storybook Storyshots

Visual regression tests are a useful way to maintain consistency for UI elements. The idea is to create "baselines" that best represent your UI elements, and then expect that code changes never deviate from this baseline, unless explicitly told to do so. While there are ways of doing this with Jest matchers, our approach creates screenshot baselines of UI elements from a built Storybook. This ensures that Storyshot stories either maintain their existing baseline, or confirm that they've been updated.

## How to include (Batect)

We recommend using Batect in order to include this in your project. Batect offers a clean way of spinning up both a Storybook server from your built Storybook components, as well as the headless browser container that creates the screenshots. Additionally, the container ensures consistency in browser representation of your components to avoid small cross-device differences of text size or pixel densities.
 
To include in a `batect.yml`, you need to add the following block:
```yml
include:
  - type: git
    repo: https://github.com/compoze-labs/storyshots.git
    ref: 0.3.1
```
 
Once included, you will now have access to two tasks: `./batect storyshots` and `./batect storyshots-update`. However, these two commands will also need to know where to find your pre-built Storybook directory:
```yml
# batect.local.yml
resultsDirectory: path/to/result/storyshots
configPath: path/to/.storyshots.config.json
staticDirectory: path/to/storybook-static
```

From here, you can build your storybook and then create your first time baselines:
```bash
# pre-build storybook task usually comes for free from storybook in your package.json
npm run build-storybook

# Running for the first time will generate new baselines, but fail purposefully (since new baselines would not want to be newly discovered in CI, for example)
./batect storyshots

# Re-running should result in a passing command, given that your stories are consistently rendered
./batect storyshots
```

## Target Single Stories
To aid in speeding up faster feedback during development, you might wish to target only a single story at a time. One option is to use an environment variable `STORYSHOTS_STORY` being sent to the command to target a single story:
```bash
# The name should match the baseline story title file:
STORYSHOTS_STORY=example-button--primary ./batect storyshots
```
