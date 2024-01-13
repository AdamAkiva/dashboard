## Prerequisites

1. Linux-based system with POSIX compliant shell (required for the scripts to work)
2. [Docker engine & docker-compose plugin](https://github.com/AdamAkiva/tutorials/blob/main/tools/docker.md)
3. Make sure the scripts have execute permissions, e.g:

```bash
chmod +x ./scripts/start.sh ./scripts/remove.sh
```

### Recommended (Will work without them):

1. [NVM - Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating)
2. [Node LTS version](https://github.com/nvm-sh/nvm#long-term-support)
3. [Debugger](https://github.com/AdamAkiva/tutorials/blob/main/web/node/debugger/typescript/README.md)

### Notes:

- **ONLY** run the application using the start/remove scripts, not directly via
  the docker. (Unless you are sure you know what you're doing)
