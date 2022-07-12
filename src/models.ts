export interface DeployCommandOption {
  commandName: string;
  actionPrefix: string;
  title: string;
  responseType: 'in_channel' | 'ephemeral';
  defaultBranch: string;
  branches: () => Promise<string[]>;
  version: (branch: string) => Promise<{
    version: string;
    buildVersion: number;
  }>;
  destinations: DeployDestination[];
}

export interface DeployDestination {
  id: string;
  name: string;
  run: (build: BuildParameters) => Promise<void>;
}

export interface Branches {
  default: string;
  branches: string[];
}

export interface Versions {
  current: string;
  updatedVersions: string[];
}

export interface BuildVersions {
  current: number;
  next: number;
  updatedVersions: number[];
}

export interface BuildParameters {
  deployment: {
    id: string;
    name: string;
  };
  currentVersion?: string;
  currentBuildVersion?: number;
  branch?: string;
  version?: string;
  buildVersion?: number;
}

export interface BuildParametersMap {
  a: string;
  b: string;
  c?: string;
  d?: number;
  e?: string;
  f?: string;
  g?: number;
}
