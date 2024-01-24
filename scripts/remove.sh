#!/bin/sh

####################################################################################

DB_MIGRATIONS_FOLDER=../be/db-migrations
DB_DATA_FOLDER=../db-dev-data
TEST_COVERAGE_FOLDER=../be/__tests__/coverage
FE_MODULES_FOLDER=../fe_node_modules
BE_MODULES_FOLDER=../be/node_modules

####################################################################################

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
    if ! INIT_SCRIPT=$(find $(pwd) $DB_MIGRATIONS_FOLDER -name "*.sql"); then
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
        rm -rf $TEST_COVERAGE_FOLDER;
    fi

    return 0;
}

remove_node_modules() {
    printf "Do you wish to remove node_modules folder? (y/n) ";
    read opn;
    if [ "${opn:-n}" = "y" ]; then
        rm -rf $FE_MODULES_FOLDER $BE_MODULES_FOLDER
    fi

    return 0;
}

remove_database() {
    printf "Do you wish to remove database folder? (requires sudo permissions) (y/n) ";
    read opn;
    if [ "${opn:-n}" = "y" ]; then
        sudo rm -rf $DB_DATA_FOLDER;
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