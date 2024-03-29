/******************************************************************************/

import type { ReactElement, HTMLInputTypeAttribute } from 'react';
/******************************************************************************/

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

/******************************************************************************/

type InputField = {
  name: string;
  required: boolean;
  type: Extract<HTMLInputTypeAttribute, 'email' | 'password' | 'tel' | 'text'>;
  icon: ReactElement;
};

type DropdownField = {
  name: string;
  required: boolean;
  type: 'dropdown';
  options: string[];
  icon: ReactElement;
};

type OnToggleClickCb = () => void;

type FormField = DropdownField | InputField;

export type { FormField, DropdownField, OnToggleClickCb };
