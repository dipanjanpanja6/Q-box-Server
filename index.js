const express = require('express')
const cross = require('cors')
const useragent = require('express-useragent')
const fileUpload = require('express-fileupload')
const http = require('http')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 7000;

var app = express()

app.use(cross({ origin: "http://localhost:8080", credentials: true }));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("cookies_secret_##$$123@@"));


const { createCookies, signUp } = require('./auth/auth')

app.post('/signUp', signUp, createCookies)




app.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true })
})







app.get('/', (req, res) => {
    return res.json({message: "This is a server # Don't mesh it up :( ",error:"Unauthorize Access"})
})

const server = http.createServer(app)
server.listen(PORT);


process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});