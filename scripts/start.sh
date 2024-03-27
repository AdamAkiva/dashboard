#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname "$(realpath "$0")");
ROOT_DIR=$(dirname "$SCRIPT_DIR");

BE_DIR="$ROOT_DIR"/be;
NPM_FE_CACHE_FOLDER="cache/fe";
NPM_BE_CACHE_FOLDER="cache/be";

DB_DATA_FOLDER="$ROOT_DIR"/db-dev-data;
DB_MIGRATIONS_FOLDER="$BE_DIR"/db/migrations;

################################################################################

start() {
    DB_INIT_SCRIPT=$(find "$DB_MIGRATIONS_FOLDER" -type f -name "*.sql");

    if [ ! -f "$DB_INIT_SCRIPT" ]; then
        printf "\nMigrations file not found. Did you follow the instructions correctly?\n\n";
        exit 1;
    fi

    printf "Building Application...\n\n";

    # Ensure the existence of db-dev-data folder.
    # Note: When files are added to this folder later, their permissions
    # will be determined by the permissions of this folder.
    mkdir -p "$DB_DATA_FOLDER" "$NPM_FE_CACHE_FOLDER" "$NPM_BE_CACHE_FOLDER";

    printf "Do you want to rebuild the images? (y/n) ";
    read -r is_rebuild;

    # Rebuild the images
    if [ "$is_rebuild" = "y" ]; then
        if ! UID="$UID" GID="$GID" DB_INIT_SCRIPT="$DB_INIT_SCRIPT" docker compose build ; then
            printf "\nDocker build failed. Solve the errors and try again.\n";
            exit 1;
        fi
    fi

    # Start the services
    if ! UID="$UID" GID="$GID" DB_INIT_SCRIPT="$DB_INIT_SCRIPT" docker compose up -d --wait ; then
        printf "\nDocker run failed. Solve the errors and try again.\n";
        exit 1;
    fi
    return 0;
}

################################################################################

# Move to scripts directory
cd "$SCRIPT_DIR" || exit 1;

start;

printf "\nApplication is running\n\n";
