const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

const sql = require('./database/controller/connection').initConnection();

app.post('/api/login', function(req, res)
{
    const username = req.body.username;
    const password = req.body.password;

    const query = `Select * From User Where Username = '${username}' and Password = '${password}';`;

    sql.query(query, function(err, rows)
    {
        if (err)
        {
            console.error(err);
            res.send({
                error: true,
                message: "Something went wrong in database retrieval. Please try again."
            });
            return;
        }

        if (rows.length === 0)
        {
            res.send({
                error: true,
                message: "Wrong Username or Password"
            });
        }
        else
        {
            res.send({
                error: false,
                message: "OK",
                // rows[0] because there should be ONLY 1 user with those credentials
                data: rows[0]
            });
        }
    })
});

app.get('/api/categories', function(req, res)
{
    const query = `Select * From Category`;

    sql.query(query, function(err, rows)
    {
        if (err)
        {
            console.error(err);
            res.send({
                error: true,
                message: "Something went wrong in database retrieval. Please try again."
            });
            return;
        }

        res.send({
            error: false,
            message: "OK",
            data: rows
        });
    })
});


app.listen(8080, () => console.log('Listening on port 8080!'));