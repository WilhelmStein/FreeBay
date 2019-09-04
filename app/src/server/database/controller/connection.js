const mysql = require('mysql');

function initConnection() {
    return ( mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'freebay',
        multipleStatements: true
    }) );
}

module.exports = {
    initConnection: initConnection
}