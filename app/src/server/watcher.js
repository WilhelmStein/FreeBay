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

async function endAuction(auctions, index)
{
    if(auctions.length - 1 < index)
    {
        watchAuctions();
        return;
    }

    let auction = auctions[index];

    let timeout = new Date(auction.Ends) - new Date();
    setTimeout(() => {
        controller.endAuction(auction.Id, auction.Name, auction.Seller_Id, auction.Seller_Name, auction.Bids[0].User.Username, auction.Bids, () => {
            endAuction(auctions, ++index);
        });
    }, timeout);
}

function watchAuctions()
{
    controller.auctions( function(payload) {
        if(payload.error)
        {
            console.error(payload.message);
            return;
        }
        console.log(payload.data);
        endAuction(payload.data, 0);
    })
}

controller.connect();
watchAuctions();
