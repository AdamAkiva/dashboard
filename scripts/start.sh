#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname "$(realpath "$0")");
ROOT_DIR=$(dirname "$SCRIPT_DIR");

DB_DATA_FOLDER="$ROOT_DIR"/db-dev-data;

################################################################################

start() {
    printf "Building Application...\n\n";

    # Ensure the existence of db-dev-data folder. 
    # Note: When files are added to this folder later, their permissions will be determined by the permissions of this folder.
    mkdir -p "$DB_DATA_FOLDER";

    printf "Do you want to rebuild the images? (y/n) ";
    read -r is_rebuild;

    # Rebuild to images
    if [ "$is_rebuild" = "y" ]; then
        if ! UID="$UID" GID="$GID" docker compose build ; then
            printf "\nDocker build failed. Solve the errors and try again.\n";
            exit 1;
        fi
    fi

    # Start the services
    UID="$UID" GID="$GID" docker compose up -d --wait;
    status=$?;

    if [ $status -ne 0 ]; then
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
