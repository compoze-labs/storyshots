# Contributing!

Hey there! Welcome and glad you're looking into how to improve our journey towards having better developer experiences :)

## Getting Started

Here's some things you'll need access to on your command line to get started:
* The triple n's: `nvm`, `node`, `npm`
* `docker` and your best friend, the Docker daemon
* `java` and `JAVA_HOME` defined (for now, because `batect` still requires Java)
* `shellspec`

Once installed, to make sure we're all on the same page:
```
npm install -g pnpm
nvm install
pnpm install
pnpm -F sample build-storybook
```

## Repository Philosophy
We try to follow test driven development as much as possible with this repository. There's a `sample-storybook` that gives us a "test bed" for the different styles of stories in a Storybook that we might wish to visually regression test against. Additionally, we use `shellspec` to, in a way, _emulate_ one of our users evolving their repository (i.e. changing storybook, updating baselines, etc.) and wishing to use our tool in their workflows.

### Running Storyshots
To get a feel for how Storyshots works, you can get started by running this command:
`pnpm start`, alternatively, `npm run start`

If you wish to change one of the stories slightly in the `sample-storybook`, make sure to run `pnpm -F sample build-storybook` again and then you can run the command again and assert that it fails against the generated baselines!

There's also a `pnpm start:update` that you can run to update the baselines images in our local repository. This will give you a feel for how the flow works with baselines, our tool, and how the user might approach using this tool in their own repository. Remember that any time you update the sample storybook, to run `pnpm -F sample build-storybook` inbetween to update the built storybook.

### Running Tests
Using this command: `pnpm test:local` will run our `shellspec` tests. These tests exist in the `spec` folder and offer a way to emulate testing our repository exactly how a user might approach it. Additionally, it utilizes a locally built version of the storyshots container to test against.

## Windows Contributors
Believe it or not, we still exist! However, if you wish to contribute, I highly suggest looking into WSL2 as a tool for best collaborating with the rest of the \*nix community. This open source project is meant to be included as a \*nix automation process, so it's important to try to immerse ourselves in the same environment as our valued users! That said -- there's for sure some patterns we can introduce in the future for helping to develop inside containers if we wish to incorporate that in the future.
