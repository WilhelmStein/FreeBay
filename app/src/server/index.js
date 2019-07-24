const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const sql = require('./database/controller/connection').initConnection();

let controller = require('./database/controller/controller').DBController
controller = new controller(sql)


app.post('/api/login', function(req, res)
{
    const username = req.body.username;
    const password = req.body.password;

    controller.login(username, password, res);
});

app.get('/api/categories', function(req, res)
{
    controller.categories(res);
});


app.listen(8080, () => console.log('Listening on port 8080!'));