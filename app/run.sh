#!/bin/bash

fuser -k 8080/tcp; npm run server &

npm start
