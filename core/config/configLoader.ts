import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export interface EnvConfig {
  retryCount: number;
  retryDelay: number;
  [key: string]: unknown;
}

export interface AppConfig {
  env: string;

  // Commerce (SFCC)
  commerceUrl: string;
  commerceUsername: string;
  commercePassword: string;

  // Salesforce
  salesforceApi: string;
  sfUsername: string;
  sfPassword: string;
  sfToken: string;

  // JDE
  jdeApi: string;
  jdeEnv: string;

  // AccelQ
  accelqUrl: string;
  accelqUsername: string;
  accelqPassword: string;

  // Reporting
  allureResultsDir: string;

  // Runtime
  retryCount: number;
  retryDelay: number;
}

function loadEnvConfig(env: string): EnvConfig {
  const configPath = path.resolve(process.cwd(), 'config', 'env', `${env}.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found for environment "${env}": ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as EnvConfig;
}

function buildConfig(): AppConfig {
  const env = process.env.ENV ?? 'dev';
  const envConfig = loadEnvConfig(env);

  return {
    env,

    // Commerce (SFCC)
    commerceUrl:      process.env.COMMERCE_URL      ?? '',
    commerceUsername: process.env.COMMERCE_USERNAME ?? '',
    commercePassword: process.env.COMMERCE_PASSWORD ?? '',

    // Salesforce
    salesforceApi: process.env.SALESFORCE_API ?? '',
    sfUsername:    process.env.SF_USERNAME    ?? '',
    sfPassword:    process.env.SF_PASSWORD    ?? '',
    sfToken:       process.env.SF_TOKEN       ?? '',

    // JDE
    jdeApi: process.env.JDE_API ?? '',
    jdeEnv: process.env.JDE_ENV ?? '',

    // AccelQ
    accelqUrl:      process.env.ACCELQ_URL      ?? '',
    accelqUsername: process.env.ACCELQ_USERNAME  ?? '',
    accelqPassword: process.env.ACCELQ_PASSWORD  ?? '',

    // Reporting
    allureResultsDir: process.env.ALLURE_RESULTS_DIR ?? 'reports/allure-results',

    // Runtime
    retryCount: envConfig.retryCount,
    retryDelay: envConfig.retryDelay,
  };
}

export const config: AppConfig = buildConfig();
