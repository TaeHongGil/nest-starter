import packageJson from '@root/../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: packageJson.appName,
  appVersion: packageJson.version,
};
