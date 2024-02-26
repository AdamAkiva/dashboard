// See: https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl-options

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('ts-node/esm', pathToFileURL('./'));
