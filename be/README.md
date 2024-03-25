# Dashboard backend

## Tech stack

### The code is written in nodeJS using typescript. The main libraries in use are:

- `Server` -> ExpressJS
- `Database` -> Drizzle-ORM (Postgres.js as the native driver)
- `Validation` -> Zod

---

## NPM Scrips

- `start:dev`: Start the server in development mode with debug information
- `test`: Run all of the tests (can be narrowed by postfixing with the filename
  you want to run)
- `test:logs`: Run all of the tests with logs enabled (can be narrowed by
  postfixing with the filename you want to run)
- `test:stress`: Run the stress test
- `lint`: Run linter & tsc on the backend (without auto-fix)
- `seed`: Seed the development database with data
- `seed:drop`: Cleanup the seeded data from the database (keep the tables)
- `generate:migrations-dev`: Generate SQL file with migrations for development.
  These migrations remove the previous ones (deleting history), so use this
  **only** in development mode
- `generate:migrations-prod`: NYI
- `generate:types`: Generate relevant types from the `openapi.yml` file. This is
  the single point of truth for the frontend and the backend
- `generate:openapi`: Generate a static html file for the `openapi.yml` file.
  This file is served by the backend **only** in development mode
- `generate:all`: Generate everything relevant to development mode. Basically a
  shorthand for `generate:migrations-dev`, `generate:types` and `generate:openapi`
- `check-global-updates`: Checks for any updates to the global npm packages you
  have installed (Should be ran on your machine, not inside the docker)
- `check-local-updates`: Checks for any updates to the project dependencies
  (dev and prod) (Can be ran on your machine or inside the docker, it does not
  matter)
- `commit-local-updates`: Commit the local package updates to package.json, so
  they can be installed using `npm install`
- `check-code-deps`: Checks if you have any packages in your code which are not
  in use anywhere. This may have false-positive values if you have a package
  which is not imported anywhere. In that case you should skip checking it,
  see the script value for an example
- `check-cir-deps`: Checks the code base for any circular dependencies (ignores
  circular type imports since they are omitted in production)
- `_start`: **Used by the docker, should not be called manually**. This script
  contains the setup for running the local environment via docker
- `_test:ci`: **Used by the docker, should not be called manually**. This script
  is used by the an external service to run the backend CI/CD pipeline
- `_build`: **Used by the docker, should not be called manually**. This script
  is used to build the application for production. This is used by an external
  service
