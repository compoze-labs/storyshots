TEST_RESULTS="test-results-local/test-results/storyshots-visual-regressions"
Describe 'the bundle'

  check_git_clean() {
    if [[ -n $(git status -s) ]]; then
      echo -e "\033[0;31m"
      echo "HEY! LISTEN!"
      echo
      echo "These tests require a clean git repo. Please stash or commit your changes as WIP before running again."
      echo
      echo "^^^^^^ SEE THIS THING ^^^^^^"
      echo -e "\033[0m"
      exit 1
    fi
  }

  reset_box_stories() {
    git checkout sample-storybook/src/stories/BigBox.stories.tsx > /dev/null 2>&1
  }
  reset_button_stories() {
    git checkout sample-storybook/src/stories/Button.stories.tsx > /dev/null 2>&1
  }

  reset_repo() {
    reset_box_stories
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
    check_git_clean

    rm -rf test-results-local
    reset_repo
    pnpm -F sample build-storybook > /dev/null 2>&1
  }

  BeforeAll 'setup'
  AfterAll 'reset_repo'

  Describe 'happy paths'

    It 'can list stories to test'
      When run storyshots_list
      The output should include '10 stories to test'
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

    It 'can detect when the baseline has deviated and show the actual vs expected'
      When run storyshots_with_ignore
      The output should include 'failed'
      The output should include '❌ bigbox--a-big-box.jpeg'
      The output should include '✅ example-page--logged-out.jpeg'
      The stderr should match pattern '*'
      The path ${TEST_RESULTS}-bigbox--a-big-box-chromium/bigbox--a-big-box-actual.jpeg should be file
      The path ${TEST_RESULTS}-bigbox--a-big-box-chromium/bigbox--a-big-box-expected.jpeg should be file
      The status should be failure
    End

    It 'can update baselines'
      When run storyshots_update
      The output should include '1 passed'
      The output should include '/storyshots/storyshots/bigbox--a-big-box.jpeg does not match, writing actual.'
      The stderr should match pattern '*'
      The status should be success
    End

  End

End
