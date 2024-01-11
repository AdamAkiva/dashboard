#!/bin/sh

check_prerequisites() {
    if ! docker --version 1> /dev/null 2> /dev/null; then
        printf "docker engine not installed, you may follow this: https://docs.docker.com/engine/install\n\n" && exit 1;
    fi
    if ! docker compose version 1> /dev/null 2> /dev/null; then
        printf "docker compose not installed, you may follow this: https://docs.docker.com/compose/install/linux/#install-the-plugin-manually\n\n" && exit 1;
    fi

    return 0;
}

start() {
    if ! INIT_SCRIPT=$(find $(pwd) ../be/$DB_MIGRATIONS_FOLDER -name "*.sql"); then
        printf "\nMigrations file not found. Did you follow the instructions correctly?\n\n" && exit 1;
    fi

    printf "Building Application...\n\n" && mkdir -p ../db-dev-data;
    if ! HOST_UID=$(id -u) \
         HOST_GID=$(id -g) \
         INIT_SCRIPT=$INIT_SCRIPT \
         docker -D compose up --build --remove-orphans \
         --always-recreate-deps --force-recreate -d --wait; then
        printf "\ndocker build failed, solve the error/s and try again\n\n" && exit 1;
    fi

    return 0;
}

####################################################################################

cd "$(dirname "$0")" || exit 1;

check_prerequisites &&
start &&
printf "\nApplication is running\n\n";