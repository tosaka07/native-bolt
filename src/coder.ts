import { BuildParametersMap, BuildParameters } from './models';

const toMap = (param: BuildParameters): BuildParametersMap => {
  return {
    a: param.deployment.id,
    b: param.deployment.name,
    c: param.currentVersion,
    d: param.currentBuildVersion,
    e: param.branch,
    f: param.version,
    g: param.buildVersion,
  };
};

const fromMap = (map: BuildParametersMap): BuildParameters => {
  return {
    deployment: {
      id: map.a,
      name: map.b,
    },
    currentVersion: map.c,
    currentBuildVersion: map.d,
    branch: map.e,
    version: map.f,
    buildVersion: map.g,
  };
};

export const encode = (value: BuildParameters): string => {
  const map = toMap(value);
  return JSON.stringify(map);
};

export const decode = (value: string): BuildParameters => {
  const object = JSON.parse(value) as BuildParametersMap;
  return fromMap(object);
};
