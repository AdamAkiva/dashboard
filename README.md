## Prerequisites

1. Linux-based system with POSIX compliant shell (required for the scripts to work)
2. [Docker engine](https://docs.docker.com/engine/install/) >= 24.0.6
3. [Docker-compose plugin](https://docs.docker.com/compose/install/linux/) >= 2.20.3
4. Make sure the scripts have execute permissions, e.g:

```bash
chmod +x ./scripts/start.sh ./scripts/remove.sh
```

### Recommended (Will work without them):

1. [NVM - Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating)
2. [Node LTS version](https://github.com/nvm-sh/nvm#long-term-support)

### Notes:

- **ONLY** run the application using the start/remove scripts, not directly via
  the docker. (Unless you are sure you know what you're doing)
