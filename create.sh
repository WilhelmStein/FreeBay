#!/bin/bash

mysql -u root -ppassword < ./app/src/server/database/sql/create.sql

cd ./data/ebay-data > /dev/null || exit 1

python3 xml_to_db.py

cd - > /dev/null || exit 1

mysql -u root -ppassword < ./app/src/server/database/sql/insert_tests.sql
