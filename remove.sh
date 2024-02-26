#!/bin/sh

################################################################################

UID=$(id -u);
GID=$(id -g);

BE_MODULES_FOLDER=be/node_modules;
FE_MODULES_FOLDER=fe/node_modules;
DB_DATA_FOLDER=./db-dev-data;

################################################################################

remove() {
  is_removed=$(UID="$UID" GID="$GID" docker compose down);

    if ! $is_removed; then
        printf "\nDocker removal failed. solve the errors and try again.\n";
        exit 1;
    fi
    
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

remove;

printf '\nRemoved Application\n\n';