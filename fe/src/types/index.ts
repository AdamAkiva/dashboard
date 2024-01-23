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

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

export type ClickEvent<
  T extends Element = Element,
  E extends MouseEvent = MouseEvent
> = React.MouseEvent<T, E>;
export type ChangeEvent<T extends Element = Element> = React.ChangeEvent<T>;

export type OnClick = <T>(e: T) => void;
export type OnChange = <T>(e: T) => void;

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
