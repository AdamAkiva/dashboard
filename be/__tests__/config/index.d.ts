import 'vitest';

/**********************************************************************************/

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface ProvidedContext {
    urls: {
      baseURL: string;
      healthCheckURL: string;
    };
  }
}
