import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  token: string;
}

export class GitHubClient {
  config: GitHubConfig;
  octoKit: Octokit;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octoKit = new Octokit({ auth: config.token });
  }

  async fetchBranches(owner: string, repo: string) {
    const res = await this.octoKit.repos.listBranches({
      owner: owner,
      repo: repo,
    });
    return res.data;
  }

  async fetchContent(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    const content = await this.octoKit.repos.getContent({
      owner: owner,
      repo: repo,
      ref: branch,
      path: path,
    });
    return content.data;
  }

  async fetchReference(owner: string, repo: string, ref: string) {
    const res = await this.octoKit.git.getRef({
      owner: owner,
      repo: repo,
      ref: ref,
    });
    return res.data;
  }

  async createReference(owner: string, repo: string, ref: string, sha: string) {
    const res = await this.octoKit.git.createRef({
      owner: owner,
      repo: repo,
      ref: ref,
      sha: sha,
    });
    return res.data;
  }

  async createOrUpdateFileContents(
    owner: string,
    repo: string,
    branch: string,
    message: string,
    path: string,
    content: string,
    sha: string,
  ) {
    const res = await this.octoKit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      branch: branch,
      message: message,
      path: path,
      content: content,
      sha: sha,
    });
    return res.data;
  }

  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string,
  ) {
    const res = await this.octoKit.pulls.create({
      owner: owner,
      repo: repo,
      head: head,
      base: base,
      title: title,
      body: body,
    });
    return res.data;
  }
}
