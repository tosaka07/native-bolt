# Native Bolt

[![npm version](https://img.shields.io/npm/v/native-bolt.svg)](https://www.npmjs.com/package/native-bolt) [![license](https://img.shields.io/npm/l/svelte.svg)](LICENSE.md)

A library for building simple distribution slack commands for native apps.

## Installation

```
$ npm install --save native-bolt
```

## Usage

First, define DeployDestination, which determines the deployment destination from the command.

In application development, CI may be used, and native-bolt can use BitriseClient and GitHubClient for easy requests.

```typescript
const triggerBitriseWorkflow = (workflowId: string) => {
  const client = new BitriseClient({ token: /*  */ })
  const run = async (params: BuildParameters) => {
    await client.triggerBuild(/* */, {
      branch: params.branch!,
      workflowId: workflowId
    })
  }
  return run
}

const appDistributionDev: DeployDestination = {
  id: 'app_distribution_development',
  name: 'App Distribution - DEV',
  run: triggerBitriseWorkflow('distribution-development'),
}
```

Next, define the DeployCommandOption that sets the command name and the DeployDestination.

```typescript
const deployOption: DeployCommandOption = {
  commandName: '/deploy_ios',
  actionPrefix: 'deploy_ios',
  title: 'Deploy iOS',
  responseType: 'in_channel',
  repo: repo,
  defaultBranch: 'develop',
  branches: branches,
  version: version,
  destinations: [appDistributionDev],
}
```

Finally, you can execute the slack command by passing App and DeployCommandOption to useDeliverEvents.

```typescript
const expressReceiver = new ExpressReceiver({
  signingSecret: /* */,
  endpoints: '/events',
  processBeforeResponse: true,
})

const app = new App({
  receiver: expressReceiver,
  token: /* */,
  processBeforeResponse: true,
})

// Events
useDeliverEvents(app, deployOption)

export const event = functions
  .region('asia-northeast1')
  .https.onRequest(expressReceiver.app)
```
