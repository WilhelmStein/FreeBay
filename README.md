# FreeBay

## Contributors

```pseudo
* Ioannis Maliaras  - 1115201500084
* Ioannis Cheilaris - 1115201500176
* Vasileios Sioros  - 1115201500144
```

## Introduction

FreeBay is a clone of the well-known online auction service "E-Bay".

## Technologies

* MySQL
* [ReactJS](https://reactjs.org/)
* [Express.js](https://expressjs.com/)
* [Node.js](https://nodejs.org/en/)
* [Sass](https://sass-lang.com/)
* [React Material UI](https://material-ui.com/)
* [Axios](https://www.npmjs.com/package/axios)
* Python3

## Installation

**Following instructions are made on linux Ubuntu**

```bash
# From root folder
sudo ./dependencies.sh
```

### Database

Follow instructions in Setup_MySQL.md if you have not configured your mysql server.

```bash
# From root folder
./create.sh -c -t items-0.xml
# Check create.sh for more information on what to insert
```
This creates the database from script ./src/server/database/sql/create.sql, inserts data from items-0.xml file and inserts data from ./src/server/database/sql/insert_tests.sql.  

Our connection is:
```js
{
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'freebay',
    multipleStatements: true
}
```

### Actual site

This project is implemented using Reactjs and Node.js mostly. That means that nodejs and npm must be installed.

```bash
# From app folder
npm install
```

This installs everything that the app needs to run

## Run - Test

```bash
# From app folder
npm run server

# From another terminal
npm start

# From another terminal
npm run watcher # a program that ends auctions asynchronously when their time comes

# From another terminal
npm run python-server
```

## Test Users

| Username | Password |
|----------|----------|
| username | password |
| rulabula | password |
