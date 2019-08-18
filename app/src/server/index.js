const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const sql = require('./database/controller/connection').initConnection();

let controller = require('./database/controller/controller').DBController
controller = new controller(sql)


app.post('/api/login', function(req, res) { controller.login(req.body.username, req.body.password, res); });

app.get('/api/categories', function(req, res) { controller.categories(res); });

app.post('/api/username', function(req, res) { controller.username(req.body.username, res); });

app.post('/api/email', function(req, res) { controller.email(req.body.email, res); });

app.post('/api/signup', function(req, res) { controller.signup(req.body, res); });

app.post('/api/search', function(req, res) { controller.search(req.body.category, req.body.text, res); });

app.get('/api/auction', function(req, res) { controller.auction(req.query.id, res); });

app.post('/api/featured', function(req, res) { controller.featured(req.body.username, res); });

app.get('/api/image', function(req, res) { controller.image(req.query.path, res); });


const options = {
    key: fs.readFileSync(path.join(__dirname, 'encryption/server.key'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, 'encryption/server.cert'), 'utf8')
  };

https.createServer(options, app).listen(8080, () => {
    console.log("server starting on port 8080")
});
