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

export interface User {
  /** @format uuid */
  id: string;
  /** @format email */
  email: string;
  firstName: string;
  lastName: string;
  /** @format phone */
  phone: string;
  gender: string;
  address: string;
  /** @format date-time */
  createdAt: string;
  isActive: boolean;
}

export interface CreateUser {
  /** @format email */
  email: string;
  /** @format password */
  password: string;
  firstName: string;
  lastName: string;
  /** @format phone */
  phone: string;
  gender: string;
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
  gender?: string;
  address?: string;
}

export type ReactivateUser = CreateUser;
