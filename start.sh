#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

DB_DATA_FOLDER="./db-dev-data";

################################################################################

start() {
    printf "Building Application...\n\n";

    #
    mkdir -p "$DB_DATA_FOLDER";

    printf "Do you want to rebuild the images? (y/n) ";
    read -r is_rebuild;

    if [ "$is_rebuild" = "y" ]; then
        if ! UID="$UID" GID="$GID" docker compose build ; then
            printf "\nDocker build failed. Solved the errors and try again.\n";
            exit 1;
        fi
    fi

    is_healthy=$(UID="$UID" GID="$GID" docker compose up -d --wait);

    if ! $is_healthy; then
        printf "\n\nDocker run failed. The logs are displayed above. Use them to solve the issue(s) and try again\n\n";
        exit 1;
    fi
    
    return 0;
}

################################################################################

start;

printf "\nApplication is running\n\n";
