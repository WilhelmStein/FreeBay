#!/bin/bash

mysql -u root -ppassword < ./app/src/server/database/sql/create.sql
mysql -u root -ppassword < ./app/src/server/database/sql/insert_tests.sql