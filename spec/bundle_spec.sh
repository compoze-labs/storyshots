Describe 'the bundle'

  reset_repo() {
    rm -rf ${STORYSHOTS_RESULTS_DIR}/test-results

    git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1

    git checkout ${STORYSHOTS_RESULTS_DIR}/example-button--large-chromium.jpeg > /dev/null 2>&1
    git checkout ${STORYSHOTS_RESULTS_DIR}/example-button--primary-chromium.jpeg > /dev/null 2>&1
    git checkout ${STORYSHOTS_RESULTS_DIR}/example-button--secondary-chromium.jpeg > /dev/null 2>&1
    git checkout ${STORYSHOTS_RESULTS_DIR}/example-button--small-chromium.jpeg > /dev/null 2>&1
  }

  storyshots() {
    ./batect --override-image storyshots=${IMAGE} storyshots
  }

  storyshots_update() {
    ./batect --override-image storyshots=${IMAGE} storyshots-update
  }

  Describe 'happy paths'
    setup() { 
      reset_repo
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    BeforeAll 'setup'

    It 'can assess the baseline of the storybooks visual regressions'
      When run storyshots
      The output should include '1 passed'
      The stderr should match pattern '*'
      The status should be success
    End

  End

  Describe 'failure cases'
  
    setup() { 
      reset_repo
      git apply spec/ensure_failure.patch
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    cleanup() {
      reset_repo
    }
    BeforeAll 'setup'
    AfterAll 'cleanup'

    It 'can detect when the baseline has deviated and show the diffs'
      When run storyshots
      The output should include '1 failed'
      The stderr should match pattern '*'
      The path ${STORYSHOTS_RESULTS_DIR}/test-results/storyshots-our-visual-regressions-should-match-the-existing-specs-chromium/example-button--primary-diff.jpeg should be file
      The status should be failure
    End

    It 'can update baselines'
      When run storyshots_update
      The output should include '1 passed'
      The output should include '/storyshots/storyshots.spec.ts-snapshots/example-button--primary-chromium.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots.spec.ts-snapshots/example-button--secondary-chromium.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots.spec.ts-snapshots/example-button--large-chromium.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots.spec.ts-snapshots/example-button--small-chromium.jpeg does not match, writing actual.'
      The stderr should match pattern '*'
      The status should be success
    End

  End

End
