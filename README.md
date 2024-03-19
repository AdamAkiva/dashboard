### Prerequisites

1. Linux-based system with POSIX compliant shell (required for the scripts to work)
2. [Docker engine & docker-compose plugin](https://github.com/AdamAkiva/tutorials/blob/main/tools/docker.md)
   preferably the latest version, otherwise you may encounter errors
3. Make sure the scripts have execute permissions, e.g:

```bash
chmod +x ./scripts/start.sh ./scripts/remove.sh
```

---

### Recommended (Will work without them):

1. [NVM - Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating)
2. [Node LTS version](https://github.com/nvm-sh/nvm#long-term-support)
3. [Debugger](https://github.com/AdamAkiva/tutorials/blob/main/web/node/debugger/typescript/README.md)

**Notes:**

- **ONLY** run the application using the start/remove scripts, not directly via
  the docker. (Unless you are sure you know what you're doing)
- For any issue(s), contact a maintainer/contributor in any way you see fit

---

### Run locally

1. Use this to start the local environment:

```bash
./scripts/start.sh
```

2. Use this to stop the local environment:

```bash
./scripts/remove.sh
```

---

### Troubleshooting

- If you encounter any permission related errors from the docker(s), follow these
  steps:

1. Stop the docker using: `yes | ./scripts/remove.sh`
2. Remove the following folders: `rm -rf ./db-dev-data ./be/node_modules ./fe/node_modules ./scripts/cache`
3. Make sure you have the latest docker and docker-compose versions (follow step 2 in the perquisites)
4. Run `yes | ./scripts/start.sh` and hope for the best
5. If the problem persists, contact a maintainer/contributor in any way you see fit
