import 'vitest';

/**********************************************************************************/

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface ProvidedContext {
    mode: 'test';
    urls: {
      baseURL: string;
      healthCheckURL: string;
    };
    db: {
      name: string;
      url: string;
    };
  }
}
