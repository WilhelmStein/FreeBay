#!/bin/bash

if [[ "$*" =~ .*-h|--help.* ]]
then
    cd ./data/ebay-data > /dev/null || exit 1

    python3 xml_to_db.py "$@"; exit 1

    cd - > /dev/null || exit 1
fi

mysql -uroot -ppassword < ./app/src/server/database/sql/create.sql

cd ./data/ebay-data > /dev/null || exit 1

python3 xml_to_db.py "$@"

cd - > /dev/null || exit 1

mysql -uroot -ppassword < ./app/src/server/database/sql/insert_tests.sql
