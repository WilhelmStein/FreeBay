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

app.post('/api/admin/users', function(req, res) { controller.admin_users(req.body.username, req.body.password, res); });

app.get('/api/categories', function(req, res) { controller.categories(res); });

app.post('/api/username', function(req, res) { controller.username(req.body.username, res); });

app.post('/api/email', function(req, res) { controller.email(req.body.email, res); });

app.post('/api/signup', function(req, res) { controller.signup(req.body, res); });

app.post('/api/admin/validate', function(req, res) { controller.admin_validate(req.body.username, req.body.password, req.body.user, res); });

app.post('/api/admin/reject', function(req, res) {controller.admin_reject(req.body.username, req.body.password, req.body.user, res); });

app.post('/api/search', function(req, res) { controller.search(req.body.category, req.body.text, res); });

app.get('/api/auction', function(req, res) { controller.auction(req.query.id, res); });

app.get('/api/user', function(req, res) { controller.user(req.query.username, res); });

app.post('/api/updateUser', function(req, res) { controller.updateUser(req.body, res); });

app.get('/api/userAuctions', function(req, res) { controller.userAuctions(req.query.username, res); });

app.get('/api/featured', function(req, res) { controller.featured(res); });

app.post('/api/recommended', function(req, res) { controller.recommended(req.body.username, res); });

app.get('/api/image', function(req, res) { controller.image(req.query.path, res); });


const options = {
    key: fs.readFileSync(path.join(__dirname, 'encryption/server.key'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, 'encryption/server.cert'), 'utf8')
  };

https.createServer(options, app).listen(8080, () => {
    console.log("server starting on port 8080")
});
