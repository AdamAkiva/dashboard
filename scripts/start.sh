#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname "$(realpath "$0")");

DB_DATA_FOLDER="../db-dev-data";

################################################################################

start() {
    printf "Building Application...\n\n";

    # To change permission for db-dev-data folder
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
    is_healthy=$(UID="$UID" GID="$GID" docker compose up -d --wait);

    if ! $is_healthy; then
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
