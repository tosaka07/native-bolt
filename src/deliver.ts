// eslint-disable-next-line no-unused-vars
import { App, StaticSelectAction, ButtonAction } from '@slack/bolt';
import {
  createBranchSelectAction,
  createAppVersionSelectAction,
  createBuildVersionSelectAction,
  createDeploymentSelectAction,
  createBuildStartBlock,
  createBuildConfirmAction,
  createErrorResponse,
} from './blocks';
// eslint-disable-next-line no-unused-vars
import { BuildParameters, BuildVersions, DeployCommandOption } from './models';
import { SemVer, inc } from 'semver';

const isNotNullOrUndefined = <T>(v?: T | null): v is T => null != v;
const range = (start: number, end: number) => {
  return [...Array(end - start + 1)].map((_, i) => start + i);
};

const useDeliverCommand = (app: App, option: DeployCommandOption) => {
  app.command(`${option.commandName}`, async ({ respond, ack }) => {
    await ack();
    try {
      await respond({
        response_type: option.responseType,
        attachments: [
          {
            blocks: createDeploymentSelectAction(
              option.title,
              option.actionPrefix,
              option.destinations,
            ),
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  });
};

const useDeploymentSelectAction = (app: App, option: DeployCommandOption) => {
  app.action(
    RegExp(`^${option.actionPrefix}_deployment_select_.*-action$`),
    async ({ payload, ack, respond }) => {
      try {
        let deployId: string;
        if (payload.type == 'button') {
          const action = payload as ButtonAction;
          deployId = action.value;
        } else {
          await respond('Invalid Parameter :(');
          return;
        }

        // ブランチを取得して BuildParam を構築
        const branches = await option.branches();
        const destination = option.destinations.filter(
          (d) => d.id == deployId,
        )[0];
        const buildParameters: BuildParameters = {
          deployment: {
            id: destination.id,
            name: destination.name,
          },
        };

        await ack();

        // ブランチ選択表示
        await respond({
          response_type: option.responseType,
          attachments: [
            {
              blocks: createBranchSelectAction(
                option.title,
                option.actionPrefix,
                {
                  default: option.defaultBranch,
                  branches: branches,
                },
                buildParameters,
              ),
            },
          ],
        });
      } catch (error) {
        await respond(createErrorResponse(error, option));
      }
    },
  );
};

const useBranchSelectAction = (app: App, option: DeployCommandOption) => {
  app.action(
    RegExp(`^${option.actionPrefix}_branch_select_.+-action$`),
    async ({ payload, ack, respond }) => {
      try {
        let buildParameters: BuildParameters;
        if (payload.type == 'button') {
          const action = payload as ButtonAction;
          buildParameters = JSON.parse(action.value) as BuildParameters;
        } else if (payload.type == 'static_select') {
          const staticSelectAction = payload as StaticSelectAction;
          buildParameters = JSON.parse(
            staticSelectAction.selected_option.value,
          ) as BuildParameters;
        } else {
          await respond('Invalid Parameter :(');
          return;
        }

        const current = await option.version(buildParameters.branch!);
        const patch = inc(new SemVer(current.version), 'patch');
        const minor = inc(new SemVer(current.version), 'minor');
        const major = inc(new SemVer(current.version), 'major');

        const versions = {
          current: current.version,
          updatedVersions: [patch, minor, major].filter(isNotNullOrUndefined),
        };
        buildParameters = {
          ...buildParameters,
          currentVersion: current.version,
          currentBuildVersion: current.buildVersion,
        };

        await ack();

        await respond({
          response_type: option.responseType,
          attachments: [
            {
              blocks: createAppVersionSelectAction(
                option.title,
                option.actionPrefix,
                versions,
                buildParameters,
              ),
            },
          ],
        });
      } catch (error) {
        await respond(createErrorResponse(error, option));
      }
    },
  );
};

const useAppVersionSelectAction = (app: App, option: DeployCommandOption) => {
  app.action(
    RegExp(`^${option.actionPrefix}_version_select_.+-action$`),
    async ({ payload, ack, respond }) => {
      try {
        let buildParameters: BuildParameters;
        if (payload.type == 'button') {
          const action = payload as ButtonAction;
          buildParameters = JSON.parse(action.value) as BuildParameters;
        } else {
          await respond('Invalid Parameter :(');
          return;
        }

        const current = buildParameters.currentBuildVersion!;
        const updatedVersions = [current];
        if (1 < current) updatedVersions.push(1);
        updatedVersions.push(...range(2, 5).map((n) => current + n));
        const buildVersions: BuildVersions = {
          current: current,
          next: current + 1,
          updatedVersions: updatedVersions.sort((a, b) => a - b),
        };

        await ack();

        await respond({
          response_type: option.responseType,
          attachments: [
            {
              blocks: createBuildVersionSelectAction(
                option.title,
                option.actionPrefix,
                buildVersions,
                buildParameters,
              ),
            },
          ],
        });
      } catch (error) {
        await respond(createErrorResponse(error, option));
      }
    },
  );
};

const useBuildVersionSelectAction = (app: App, option: DeployCommandOption) => {
  app.action(
    RegExp(`^${option.actionPrefix}_build_version_select_.+-action$`),
    async ({ payload, ack, respond }) => {
      try {
        let buildParameters: BuildParameters;
        if (payload.type == 'button') {
          const action = payload as ButtonAction;
          buildParameters = JSON.parse(action.value) as BuildParameters;
        } else if (payload.type == 'static_select') {
          const staticSelectAction = payload as StaticSelectAction;
          buildParameters = JSON.parse(
            staticSelectAction.selected_option.value,
          ) as BuildParameters;
        } else {
          await respond('Invalid Parameter :(');
          return;
        }

        await ack();

        await respond({
          response_type: option.responseType,
          attachments: [
            {
              blocks: createBuildConfirmAction(
                option.title,
                option.actionPrefix,
                buildParameters,
              ),
            },
          ],
        });
      } catch (error) {
        await respond(createErrorResponse(error, option));
      }
    },
  );
};

const useBuildConfirmOKAction = (app: App, option: DeployCommandOption) => {
  app.action(
    `${option.actionPrefix}_build_confirm_ok-action`,
    async ({ payload, body, ack, respond }) => {
      try {
        const action = payload as ButtonAction;
        const buildParameters = JSON.parse(action.value) as BuildParameters;

        const destination = option.destinations.filter(
          (d) => d.id == buildParameters.deployment.id,
        )[0];

        await ack();

        await destination.run(buildParameters);

        await respond({
          response_type: option.responseType,
          mrkdwn: true,
          text: `*${option.title} Started!*`,
          attachments: [
            {
              blocks: createBuildStartBlock(body.user.id, buildParameters),
              color: 'good',
            },
          ],
        });
      } catch (error) {
        await respond(createErrorResponse(error, option));
      }
    },
  );
};

const useBuildConfirmCancelAction = (app: App, option: DeployCommandOption) => {
  app.action(
    `${option.actionPrefix}_build_confirm_cancel-action`,
    async ({ ack, respond }) => {
      await ack();
      await respond({
        response_type: option.responseType,
        text: `${option.title} Cancelled.`,
      });
    },
  );
};

export const useDeliverEvents = (app: App, option: DeployCommandOption) => {
  useDeliverCommand(app, option);
  useDeploymentSelectAction(app, option);
  useBranchSelectAction(app, option);
  useAppVersionSelectAction(app, option);
  useBuildVersionSelectAction(app, option);
  useBuildConfirmOKAction(app, option);
  useBuildConfirmCancelAction(app, option);
};
