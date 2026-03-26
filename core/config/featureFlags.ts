import * as fs from 'fs';
import * as path from 'path';
import { config } from './configLoader';

export interface FeatureFlags {
  orderFlow: boolean;
  subscriptionFlow: boolean;
  newCheckout: boolean;
  [key: string]: boolean;
}

function loadFeatureFlags(): FeatureFlags {
  const flagsPath = path.resolve(process.cwd(), 'config', 'feature-flags', `${config.env}.json`);

  if (!fs.existsSync(flagsPath)) {
    throw new Error(`Feature flags file not found for environment "${config.env}": ${flagsPath}`);
  }

  return JSON.parse(fs.readFileSync(flagsPath, 'utf-8')) as FeatureFlags;
}

export const flags: FeatureFlags = loadFeatureFlags();
