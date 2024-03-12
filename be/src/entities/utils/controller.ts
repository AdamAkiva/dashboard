import type { Debug } from '../../types/index.js';

/**********************************************************************************/

export function logWrapper<T>(
  fn: () => T,
  debug: { instance: ReturnType<typeof Debug>; msg: string }
) {
  const { instance: debugInstance, msg } = debug;

  debugInstance(msg);
  const res = fn();
  debugInstance(parseDebugResponseMessage(msg));

  return res;
}

export async function asyncLogWrapper<T>(
  fn: () => Promise<T>,
  debug: { instance: ReturnType<typeof Debug>; msg: string }
) {
  const { instance: debugInstance, msg } = debug;

  debugInstance(msg);
  const res = await fn();
  debugInstance(parseDebugResponseMessage(msg));

  return res;
}

/**********************************************************************************/

function parseDebugResponseMessage(msg: string) {
  return `${msg.charAt(0).toLowerCase() + msg.slice(1)} done`;
}
