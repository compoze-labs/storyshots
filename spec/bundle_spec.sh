Describe 'the bundle'

  storyshots() {
    ./batect --override-image storyshots=${IMAGE} storyshots
  }

  Describe 'happy paths'
    setup() { 
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    BeforeAll 'setup'

    It 'can assess the baseline of the storybooks visual regressions'
      When run storyshots
      The output should include '1 passed'
      The status should be success
    End

  End

  Describe 'failure cases'

    setup() { 
      rm -rf ${STORYSHOTS_RESULTS_DIR}/test-results
      git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1
      git apply spec/ensure_failure.patch
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    cleanup() {
      git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1
    }
    BeforeAll 'setup'
    AfterAll 'cleanup'

    It 'can detect when the baseline has deviated and show the diffs'
      When run storyshots
      The output should include '1 failed'
      The path ${STORYSHOTS_RESULTS_DIR}/test-results/storyshots-our-visual-regressions-should-match-the-existing-specs-chromium/example-button--primary-diff.jpeg should be file
      The status should be failure
    End

  End

End
