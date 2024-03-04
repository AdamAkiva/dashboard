import type { EnvironmentVariables, Mode } from '../types/index.js';

import { ERR_CODES } from './constants.js';
import {
  isDevelopmentMode,
  isProductionMode,
  isTestMode
} from './functions.js';

/**********************************************************************************/

export const getEnv = (): EnvironmentVariables => {
  const mode = process.env.NODE_ENV as Mode;

  checkRuntimeEnv(mode);
  checkEnvVariables(mode);

  return {
    mode: mode,
    server: {
      port: process.env.SERVER_PORT!,
      url: process.env.SERVER_URL!,
      apiRoute: process.env.API_ROUTE!,
      healthCheck: {
        route: process.env.HEALTH_CHECK_ROUTE!,
        allowedHosts: new Set(process.env.ALLOWED_HOSTS!.split(','))
      },
      allowedOrigins: new Set(process.env.ALLOWED_ORIGINS!.split(','))
    },
    db: process.env.DB_URI!
  };
};

const checkRuntimeEnv = (mode?: string): mode is Mode => {
  if (isDevelopmentMode(mode) || isTestMode(mode) || isProductionMode(mode)) {
    return true;
  }

  console.error(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.exit(ERR_CODES.EXIT_NO_RESTART);
};

const checkEnvVariables = (mode: Mode) => {
  let missingValues = '';
  checkMissingEnvVariables(mode).forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });
  if (missingValues) {
    console.error(`\nMissing the following env vars:\n${missingValues}`);

    process.exit(ERR_CODES.EXIT_NO_RESTART);
  }
};

const checkMissingEnvVariables = (mode: Mode) => {
  const errMap = new Map<string, string>([
    ['SERVER_PORT', `Missing 'SERVER_PORT' environment variable`],
    ['SERVER_URL', `Missing 'SERVER_URL' environment variable`],
    ['API_ROUTE', `Missing 'API_ROUTE' environment variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE' environment variable`],
    ['ALLOWED_HOSTS', `Missing 'ALLOWED_HOSTS' environment variable`],
    ['ALLOWED_ORIGINS', `Missing 'ALLOWED_ORIGINS' environment variable`],
    ['DB_URI', `Missing 'DB_URI' environment variable`]
  ]);

  if (mode === 'development') {
    errMap.set(
      'SERVER_DEBUG_PORT',
      `Missing 'SERVER_DEBUG_PORT' environment variable`
    );
  }

  return errMap;
};
