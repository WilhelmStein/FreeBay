const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const upload = multer({dest: 'src/server/database/images/'}).single('file');

const spawn = require('child_process').spawn

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


app.post('/api/login', function (req, res) { controller.login(req.body.username, req.body.password, res); });

app.post('/api/admin/users', function (req, res) { controller.admin_users(req.body.username, req.body.password, res); });

app.get('/api/categories', function (req, res) { controller.categories(res); });

app.post('/api/username', function (req, res) { controller.username(req.body.username, res); });

app.post('/api/usernames', function (req, res) { controller.usernames(req.body.username, req.body.password, res); });

app.post('/api/email', function (req, res) { controller.email(req.body.email, res); });

app.post('/api/signup', function (req, res) { controller.signup(req.body, res); });

app.post('/api/admin/validate', function (req, res) { controller.admin_validate(req.body.username, req.body.password, req.body.user, res); });

app.post('/api/admin/reject', function (req, res) { controller.admin_reject(req.body.username, req.body.password, req.body.user, res); });

app.post('/api/admin/auctions', function (req, res) { controller.admin_auctions(req.body.username, req.body.password, res); });

app.post('/api/search', function (req, res) { controller.search(req.body.category, req.body.text, res); });

app.get('/api/auction', function (req, res) { controller.auction(req.query.id, res); });

app.get('/api/publicUserDetails', function(req, res) { controller.publicUserDetails(req.query.username, res); });

app.post('/api/getUser', function(req, res) { controller.getUser(req.body.username, req.body.password, res); });

app.get('/api/user', function (req, res) { controller.user(req.query.username, res); });

app.post('/api/updateUser', function (req, res) { controller.updateUser(req.body, res); });

app.get('/api/userAuctions', function (req, res) { controller.userAuctions(req.query.username, res); });

app.post('/api/userWatchedAuctions', function(req, res) { controller.userWatchedAuctions(req.body.username, req.body.password, res); });

app.get('/api/featured', function(req, res) { controller.featured(res); });

app.get('/api/featured', function (req, res) { controller.featured(res); });

app.post('/api/recommended', function (req, res) { controller.recommended(req.body.username, res); });

app.get('/api/image', function (req, res) { controller.image(req.query.path, res); });

app.post('/api/uploadImage', function (req, res) { 
    upload(req, res, (err) => {
        
        if (err) 
        {
            console.error(err)
            res.send({
                error: true,
                message: "Something went wrong with uploading middleware"
            })
        }
        
        const filename = `${__dirname}/database/images/${req.file.filename}`
        fs.rename(filename, `${filename}.${req.file.mimetype.split("/")[1]}`, (err) => {
            if (err)
            {
                console.error(err);
                res.send({
                    error: true,
                    message: "Something went wrong with uploading middleware"
                })
            }
        });

        controller.uploadImage(req.body.auction_id, `${req.file.filename}.${req.file.mimetype.split("/")[1]}`, res);
    })
})

app.post('/api/notifications', function (req, res) { controller.notifications(req.body.username, req.body.password, res); });

app.post('/api/readNotification', function (req, res) { controller.readNotification(req.body.username, req.body.password, req.body.notification, res); });

app.post('/api/messages', function (req, res) { controller.messages(req.body.username, req.body.password, res); });

app.post('/api/readMessage', function (req, res) { controller.readMessage(req.body.username, req.body.password, req.body.message, res); });

app.post('/api/sendMessage', function (req, res) { controller.sendMessage(req.body.username, req.body.password, req.body.recipient, req.body.subject, req.body.text, req.body.reply, res); });

app.post('/api/deleteMessage', function (req, res) { controller.deleteMessage(req.body.username, req.body.password, req.body.message, req.body.who, res); });

app.post('/api/placeBid', function(req, res) { controller.placeBid(req.body.username, req.body.password, req.body.auction_id, req.body.amount, res); });

app.post('/api/buyout', function(req, res) { controller.buyout(req.body.username, req.body.password, req.body.auction_id, res) })

app.post('/api/postAuction', function(req, res) { controller.postAuction(req.body, res); });

const options = {
    key: fs.readFileSync(path.join(__dirname, 'encryption/server.key'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, 'encryption/server.cert'), 'utf8')
};

https.createServer(options, app).listen(8080, () => {
    console.log("server starting on port 8080")
});

