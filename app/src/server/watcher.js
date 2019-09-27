const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs'); 

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const DBController = require('./database/controller/controller').DBController
const controller = new DBController(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'freebay',
        multipleStatements: true
    }
)

controller.connect();

// while(true) {
    controller.auctions( function(payload) {
        if(payload.error)
        {
            console.error(payload.message);
            return;
        }

        let auctions = payload.data;

        
    })
// }


