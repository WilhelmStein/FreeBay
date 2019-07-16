const express = require('express');
const sql = require('./connection').initConnection();
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('dist'));
app.use(bodyParser.json());

app.listen(8080, () => console.log('Listening on port 8080!'));