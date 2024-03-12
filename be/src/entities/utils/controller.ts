import type { Debug } from '../../types/index.js';

/**********************************************************************************/

export function debugWrapper<T = unknown, P = unknown>(
  cb: { fn: (args: P) => T; args: P },
  debug: { instance: ReturnType<typeof Debug>; msg: string }
): T {
  const { fn, args } = cb;
  const { instance: debugInstance, msg } = debug;

  debugInstance(msg);
  const res = fn(args);
  debugInstance(parseDebugResponseMessage(msg));

  return res;
}

export async function asyncDebugWrapper<T = unknown, P = unknown>(
  cb: { fn: (args: P) => Promise<T>; args: P },
  debug: { instance: ReturnType<typeof Debug>; msg: string }
): Promise<T> {
  const { fn, args } = cb;
  const { instance: debugInstance, msg } = debug;

  debugInstance(msg);
  const res = await fn(args);
  debugInstance(parseDebugResponseMessage(msg));

  return res;
}

/**********************************************************************************/

function parseDebugResponseMessage(msg: string) {
  return `${msg.charAt(0).toLowerCase() + msg.slice(1)} done`;
}
