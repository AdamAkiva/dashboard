import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import ReactDOM from 'react-dom/client';

/**********************************************************************************/

export type UnknownObject = { [key: string]: unknown };
export type MaybeArray<T> = T | T[];

export type AddRequired<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type AddOptional<T, K extends keyof T> = Omit<T, K> &
  Pick<Partial<T>, K>;
export type SwapKeysValue<T, K extends keyof T, V> = Omit<T, K> & {
  [P in K]: V;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<T> = T extends (...args: any) => any
  ? PromiseFulfilledResult<Awaited<ReturnType<T>>>
  : PromiseFulfilledResult<Awaited<T>>;

/**********************************************************************************/

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

/**********************************************************************************/

export {
  React,
  ReactDOM,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
};
