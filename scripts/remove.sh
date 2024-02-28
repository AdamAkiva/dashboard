#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

SCRIPT_DIR=$(dirname "$(realpath "$0")");
ROOT_DIR=$(dirname "$SCRIPT_DIR");

BE_MODULES_FOLDER="$ROOT_DIR"/be/node_modules;
FE_MODULES_FOLDER="$ROOT_DIR"/fe/node_modules;
DB_DATA_FOLDER="$ROOT_DIR"/db-dev-data;

################################################################################

remove() {
    # Stop docker services
    UID="$UID" GID="$GID" docker compose down;
    status=$?;

    if [ $status -ne 0 ]; then
        printf "\nDocker removal failed. solve the errors and try again.\n";
        exit 1;
    fi

    # Optional removes
    remove_node_modules;
    remove_db_data;

    return 0;
}

remove_node_modules() {
    printf "Do you wish to remove node modules folders? (y/n) ";
    read -r is_remove;

    if [ "$is_remove" = "y" ]; then
        rm -rf "$FE_MODULES_FOLDER";
        rm -rf "$BE_MODULES_FOLDER";
    fi
}

remove_db_data() {
    printf "Do you wish to remove database data folder? (y/n) ";
    read -r is_remove;

    if [ "$is_remove" = "y" ]; then
        rm -rf "$DB_DATA_FOLDER";
    fi
}

################################################################################

# Move to scripts directory
cd "$SCRIPT_DIR" || exit 1;

remove;

printf '\nRemoved Application\n\n';