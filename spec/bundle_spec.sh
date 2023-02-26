TEST_RESULTS="test-results-local/test-results/storyshots-visual-regressions"
BATECT_STORYSHOTS="./batect --override-image storyshots=${IMAGE} --config-vars-file spec/batect.test.yml"
Describe 'the bundle'

  reset_button_stories() {
    git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1
  }
  reset_repo() {
    rm -rf test-results-local

    reset_button_stories
  }

  run_batect() {
    ./batect --override-image storyshots=${IMAGE} --config-vars-file $2 $1
  }

  storyshots_all() {
    run_batect storyshots spec/batect.all.yml
  }

  storyshots_with_ignore() {
    run_batect storyshots spec/batect.ignore.yml
  }

  storyshots_single() {
    STORYSHOTS_STORY="example-button--primary" run_batect storyshots spec/batect.ignore.yml
  }

  storyshots_update() {
    run_batect storyshots-update spec/batect.ignore.yml
  }

  storyshots_list() {
    run_batect storyshots-list spec/batect.all.yml
  }

  setup() { 
    reset_repo
    pnpm -F sample build-storybook > /dev/null 2>&1
  }

  BeforeAll 'setup'
  AfterAll 'reset_repo'

  Describe 'happy paths'

    It 'can list stories to test'
      When run storyshots_list
      The output should include '9 stories to test'
      The output should include '🔘 example-button--primary'
      The output should include '🔘 example-button--secondary'
      The stderr should match pattern '*'
      The status should be success
    End

    It 'can generate a new set of baselines and fail if they do not exist'
      When run storyshots_all
      The output should include 'failed'
      The output should include '✅ example-button--primary.jpeg'
      The output should include '✅ example-button--secondary.jpeg'
      The stderr should match pattern '*'
      The status should be failure
    End

    It 'can assess the baselines of a full storybook`s visual regressions'
      When run storyshots_with_ignore
      The output should include '1 passed'
      The output should include '✅ example-button--primary.jpeg'
      The output should include '✅ example-page--logged-out.jpeg'
      The output should include '💤 example-animated--animated-in-circle.jpeg (ignored via configuration)'
      The stderr should match pattern '*'
      The status should be success
    End

    It 'can assess the baseline of a single storyshot'
      When run storyshots_single
      The output should include '1 passed'
      The output should include '✅ example-button--primary.jpeg'
      The output should not include '✅ example-page--logged-out.jpeg'
      The stderr should match pattern '*'
      The status should be success
    End

    Describe 'title-based configuration'
      setup_target_single() { 
        git apply spec/target_single.patch
        pnpm -F sample build-storybook > /dev/null 2>&1
      }
      BeforeAll 'setup_target_single'
      AfterAll 'reset_button_stories'

      It 'can assess the baseline of a single storyshot by title'
        When run storyshots_with_ignore
        The output should include '1 passed'
        The output should include '✅ example-button--primary.jpeg'
        The output should not include '✅ example-page--logged-out.jpeg'
        The stderr should match pattern '*'
        The status should be success
      End
    End

  End

  Describe 'failure cases'

    setup_new_diffs() { 
      git apply spec/ensure_failure.patch
      pnpm -F sample build-storybook > /dev/null 2>&1
    }
    BeforeAll 'setup_new_diffs'

    It 'can detect when the baseline has deviated and show the diffs'
      When run storyshots_with_ignore
      The output should include 'failed'
      The output should include '❌ example-button--primary.jpeg'
      The output should include '✅ example-page--logged-out.jpeg'
      The stderr should match pattern '*'
      The path ${TEST_RESULTS}-example-button--primary-chromium/example-button--primary-diff.jpeg should be file
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
