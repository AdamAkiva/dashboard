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

remove() {
    if ! INIT_SCRIPT=$(find $(pwd) ../be/$DB_MIGRATIONS_FOLDER -name "*.sql"); then
        printf "\nMigrations file not found. Did you follow the instructions correctly?\n\n" && exit 1;
    fi

    if ! HOST_UID=$(id -u) \
         HOST_GID=$(id -g) \
         INIT_SCRIPT=$INIT_SCRIPT \
         docker compose down; then
        printf "\ndocker removal failed, solve the error/s and try again\n\n" && exit 1;
    fi

    return 0;
}

remove_test_coverage() {
    printf "Do you wish to remove tests coverage folder? (y/n) ";
    read opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf ../be/coverage;
    fi

    return 0;
}

remove_node_modules() {
    printf "Do you wish to remove node_modules folder? (y/n) ";
    read opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf ../fe/node_modules \
               ../fe/.cache \
               ../fe/.npm \
               ../be/node_modules \
               ../be/.npm;
    fi

    return 0;
}

remove_database() {
    printf "Do you wish to remove database folder? (requires sudo permissions) (y/n) ";
    read opn;
    if [ "${opn:-n}" = "y" ]; then
        sudo rm -rf ../db-dev-data;
    fi

    return 0;
}

####################################################################################

cd "$(dirname "$0")" || exit 1;

check_prerequisites && remove;

remove_test_coverage;
remove_node_modules;
remove_database;

printf '\nRemoved Application\n\n';