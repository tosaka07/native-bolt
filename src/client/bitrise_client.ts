// eslint-disable-next-line no-unused-vars
import axios, { AxiosInstance } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

export interface Build {
  buildNumber: number;
  buildSlug: string;
  buildUrl: string;
  message: string;
  service: string;
  slug: string;
  status: string;
  triggeredWorkflow: string;
}

export interface BuildParams {
  branch: string;
  branchDest?: string;
  branchDestRepoOwner?: string;
  branchRepoOwner?: string;
  buildRequestSlug?: string;
  commitHash?: string;
  commitMessage?: string;
  commitPaths?: {
    added: string[];
    modified: string[];
    removed: string[];
  }[];
  diffUrl?: string;
  environments?: {
    mappedTo: string;
    value: string;
    isExpand: boolean;
  }[];
  pullRequestAuthor?: string;
  pullRequestHeadBranch?: string;
  pullRequestId?: {};
  pullRequestMergeBranch?: string;
  pullRequestRepositoryUrl?: string;
  skipGitStatusReport?: boolean;
  tag?: string;
  workflowId?: string;
}

export interface BitriseConfig {
  token: string;
}
/**
 * Bitrise Client
 *
 * @export
 * @class BitriseClient
 */
export class BitriseClient {
  config: BitriseConfig;
  axios: AxiosInstance;
  /**
   *Creates an instance of BitriseClient.
   * @param {BitriseConfig} config
   * @memberof BitriseClient
   */
  constructor(config: BitriseConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: 'https://api.bitrise.io/v0.1',
      headers: {
        Authorization: config.token,
      },
    });
    this.axios.interceptors.request.use((config) => {
      if (!config.data || typeof config.data !== 'object') {
        return config;
      }
      config.data = snakecaseKeys(config.data, { deep: true });
      return config;
    });
    this.axios.interceptors.response.use((response) => {
      if (!response.data || typeof response.data !== 'object') {
        return response;
      }
      response.data = camelcaseKeys(response.data, { deep: true });
      return response;
    });
  }
  /**
   * Trigger a new build.
   *
   * @param {string} appSlug
   * @param {BuildParams} params
   * @return {Promise<Build>}
   * @memberof BitriseClient
   */
  async triggerBuild(appSlug: string, params: BuildParams): Promise<Build> {
    return await this.axios({
      method: 'POST',
      url: `/apps/${appSlug}/builds`,
      data: this.createParams(params),
    }).then((res) => res.data as Build);
  }
  /**
   * Create the parameters for the BitriseAPI.
   *
   * @private
   * @param {BuildParams} param
   * @return {}
   * @memberof BitriseClient
   */
  private createParams(param: BuildParams) {
    return {
      buildParams: {
        ...param,
      },
      hookInfo: {
        type: 'bitrise',
      },
    };
  }
}
