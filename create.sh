#!/bin/bash

mysql -u root -ppassword < ./app/src/server/database/sql/create.sql

cd ./data/ebay-data

python3 xml_to_db.py

cd -

mysql -u root -ppassword < ./app/src/server/database/sql/header.sql