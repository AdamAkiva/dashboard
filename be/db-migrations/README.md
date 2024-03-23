# Migrations related folder

This folder holds the different migration versions that were on the database

[Additional information](https://orm.drizzle.team/kit-docs)

---

## Cheatsheet

### Main actions: (Run inside docker container)

- Create migrations: `npm run generate-migrations`

### Infrequent but useful commands

- Remove specific version: `npx drizzle-kit drop`
- Updating changes of metadata from drizzle: `npx drizzle-kit up:pg`
- Checks the consistency of our migrations: `npx drizzle-kit check:pg`

[Additional commands](https://orm.drizzle.team/kit-docs/commands)
