const mysql = require('mysql');

function initConnection() {
    return ( mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'sdi1500084'
    }) );
}

module.exports = {
    initConnection: initConnection
}