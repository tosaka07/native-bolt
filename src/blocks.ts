// eslint-disable-next-line no-unused-vars
import { KnownBlock, Button, RespondArguments } from '@slack/bolt';
// eslint-disable-next-line no-unused-vars
import { Branches, BuildParameters, BuildVersions, Versions } from './models';

export const createHeaderBlock = (text: string): KnownBlock => {
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text: text,
      emoji: true,
    },
  };
};

export const createMarkdownBlock = (text: string): KnownBlock => {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: text,
    },
  };
};

export const createErrorResponse = (
  error: any,
  option: {
    responseType: 'in_channel' | 'ephemeral';
    title: string;
  },
): RespondArguments => {
  return {
    response_type: option.responseType,
    mrkdwn: true,
    text: `*${option.title} Failed!*`,
    attachments: [
      {
        text: `${error}`,
        color: 'danger',
      },
    ],
  };
};

export const createDeploymentSelectAction = (
  title: string,
  actionPrefix: string,
  destinations: {
    id: string;
    name: string;
  }[],
): KnownBlock[] => {
  return [
    createHeaderBlock(title),
    createMarkdownBlock('*Deployment*:'),
    {
      type: 'actions',
      elements: destinations.map((d) => {
        return {
          type: 'button',
          text: {
            type: 'plain_text',
            text: d.name,
            emoji: true,
          },
          value: d.id,
          action_id: `${actionPrefix}_deployment_select_${d.id}-action`,
        };
      }),
    },
  ];
};

export const createBranchSelectAction = (
  title: string,
  actionPrefix: string,
  branches: Branches,
  buildParameters: BuildParameters,
): KnownBlock[] => {
  return [
    createHeaderBlock(title),
    createMarkdownBlock(
      `*Deployment*: ${buildParameters.deployment.name}\n*Branch*:`,
    ),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: branches.default,
          },
          style: 'primary',
          value: JSON.stringify({
            ...buildParameters,
            branch: branches.default,
          }),
          action_id: `${actionPrefix}_branch_select_button-action`,
        },
        {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Other branch...',
            emoji: true,
          },
          options: branches.branches.map((branch) => {
            return {
              text: {
                type: 'plain_text',
                text: branch,
                emoji: true,
              },
              value: JSON.stringify({ ...buildParameters, branch: branch }),
            };
          }),
          action_id: `${actionPrefix}_branch_select_static_select-action`,
        },
      ],
    },
  ];
};

export const createAppVersionSelectAction = (
  title: string,
  actionPrefix: string,
  versions: Versions,
  buildParameters: BuildParameters,
): KnownBlock[] => {
  return [
    createHeaderBlock(title),
    createMarkdownBlock(
      `*Deployment*: ${buildParameters.deployment.name}\n*Branch*: ${buildParameters.branch}\n*Version*: \`${buildParameters.currentVersion}(${buildParameters.currentBuildVersion})\` -> \`?.?.?(?)\``,
    ),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: versions.current,
          },
          style: 'primary',
          value: JSON.stringify({
            ...buildParameters,
            version: versions.current,
          }),
          action_id: `${actionPrefix}_version_select_${versions.current}-action`,
        },
        ...versions.updatedVersions.map((v): Button => {
          return {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: v,
            },
            value: JSON.stringify({ ...buildParameters, version: v }),
            action_id: `${actionPrefix}_version_select_${v}-action`,
          };
        }),
      ],
    },
  ];
};

export const createBuildVersionSelectAction = (
  title: string,
  actionPrefix: string,
  buildVersions: BuildVersions,
  buildParameters: BuildParameters,
): KnownBlock[] => {
  return [
    createHeaderBlock(title),
    createMarkdownBlock(
      `*Deployment*: ${buildParameters.deployment.name}\n*Branch*: ${buildParameters.branch}\n*Version*: \`${buildParameters.currentVersion}(${buildParameters.currentBuildVersion})\` -> \`${buildParameters.version}(?)\``,
    ),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: `${buildVersions.next}`,
          },
          style: 'primary',
          value: JSON.stringify({
            ...buildParameters,
            buildVersion: buildVersions.next,
          }),
          action_id: `${actionPrefix}_build_version_select_${buildVersions.next}-action`,
        },
        ...buildVersions.updatedVersions.map((v) => {
          return {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: `${v}`,
            },
            value: JSON.stringify({
              ...buildParameters,
              buildVersion: v,
            }),
            action_id: `${actionPrefix}_build_version_select_${v}-action`,
          };
        }),
      ],
    },
  ];
};

export const createBuildConfirmAction = (
  title: string,
  actionPrefix: string,
  buildBarameters: BuildParameters,
): KnownBlock[] => {
  return [
    createHeaderBlock(title),
    createMarkdownBlock(
      `*Deployment*: ${buildBarameters.deployment.name}\n*Branch*: ${buildBarameters.branch}\n*Version*: \`${buildBarameters.currentVersion}(${buildBarameters.currentBuildVersion})\` -> \`${buildBarameters.version}(${buildBarameters.buildVersion})\``,
    ),
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: 'Deploy',
          },
          style: 'primary',
          value: JSON.stringify(buildBarameters),
          action_id: `${actionPrefix}_build_confirm_ok-action`,
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            emoji: true,
            text: 'Cancel',
          },
          value: 'Cancel',
          action_id: `${actionPrefix}_build_confirm_cancel-action`,
        },
      ],
    },
  ];
};

export const createBuildStartBlock = (
  user: string,
  buildParameters: BuildParameters,
): KnownBlock[] => {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `triggered by <@${user}>`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Deployment:*\n${buildParameters.deployment.name}`,
        },
        {
          type: 'mrkdwn',
          text: `*Branch:*\n${buildParameters.branch}`,
        },
        {
          type: 'mrkdwn',
          text: `*Version:*\n${buildParameters.version}(${buildParameters.buildVersion})`,
        },
        {
          type: 'mrkdwn',
          text: `*Current version:*\n${buildParameters.currentVersion}(${buildParameters.currentBuildVersion})`,
        },
      ],
    },
  ];
};
