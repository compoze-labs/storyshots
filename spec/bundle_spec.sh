TEST_RESULTS="test-results-local/test-results/storyshots-visual-regressions-specs-chromium"
BATECT_STORYSHOTS="./batect --override-image storyshots=${IMAGE} --config-vars-file spec/batect.test.yml"
Describe 'the bundle'

  reset_repo() {
    rm -rf test-results-local

    git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1
  }

  run_batect() {
    ./batect --override-image storyshots=${IMAGE} --config-vars-file spec/batect.test.yml $1
  }

  storyshots_full() {
    run_batect storyshots
  }

  storyshots_update() {
    run_batect storyshots-update
  }

  setup() { 
    reset_repo
    pnpm -F sample build-storybook > /dev/null 2>&1
  }

  BeforeAll 'setup'
  AfterAll 'reset_repo'

  Describe 'happy paths'

    It 'can generate a new set of baselines and fail if they do not exist'
      When run storyshots_full
      The output should include '1 failed'
      The output should include 'example-button--primary'
      The output should include 'example-button--secondary'
      The stderr should match pattern '*'
      The status should be failure
    End

    It 'can assess the baselines of a full storybook`s visual regressions'
      When run storyshots_full
      The output should include '1 passed'
      The output should include 'example-button--primary'
      The output should include 'example-page--logged-out'
      The stderr should match pattern '*'
      The status should be success
    End

  End

  Describe 'failure cases'

    setup_new_diffs() { 
      git apply spec/ensure_failure.patch
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    BeforeAll 'setup_new_diffs'

    It 'can detect when the baseline has deviated and show the diffs'
      When run storyshots_full
      The output should include '1 failed'
      The output should include 'example-button--primary'
      The output should include 'example-page--logged-out'
      The stderr should match pattern '*'
      The path ${TEST_RESULTS}/example-button--primary-diff.jpeg should be file
      The status should be failure
    End

    It 'can update baselines'
      When run storyshots_update
      The output should include '1 passed'
      The output should include '/storyshots/storyshots/example-button--primary.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots/example-button--secondary.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots/example-button--large.jpeg does not match, writing actual.'
      The output should include '/storyshots/storyshots/example-button--small.jpeg does not match, writing actual.'
      The stderr should match pattern '*'
      The status should be success
    End

  End

End
