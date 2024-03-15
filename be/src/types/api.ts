/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type Users = User[];

export interface User {
  /** @format uuid */
  id: string;
  /** @format email */
  email: string;
  firstName: string;
  lastName: string;
  /** @format phone */
  phone: string;
  gender: 'male' | 'female' | 'other';
  address: string;
}

export type CreatedUser = User;

export type UpdatedUser = User;

/**
 * @format uuid
 * @example "adb3271f-94dc-4169-80e9-3d4c8a90201f"
 */
export type DeletedUser = string;

/**
 * @format uuid
 * @example "adb3271f-94dc-4169-80e9-3d4c8a90201f"
 */
export type ReactivatedUser = string;

export interface CreateUser {
  /** @format email */
  email: string;
  /** @format password */
  password: string;
  firstName: string;
  lastName: string;
  /** @format phone */
  phone: string;
  gender: 'male' | 'female' | 'other';
  address: string;
}

export interface UpdateUser {
  /** @format email */
  email?: string;
  /** @format password */
  password?: string;
  firstName?: string;
  lastName?: string;
  /** @format phone */
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}
