const express = require('express')
const cross = require('cors')
const useragent = require('express-useragent')
const fileUpload = require('express-fileupload')
const fs = require('fs');
const https = require('https')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 7000;

var app = express()

app.use(cross({ origin: "http://localhost:8080", credentials: true }));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("cookies_secret_##$$123@@"));

// ############################StudentAccount################################

const { createCookies, signUp,login } = require('./auth/studentAuth')

app.post('/api/signUp', signUp, createCookies)
app.post('/api/login', login, createCookies)



// @@@@@@@@@@@@@@@@@@@@@@@@@@TeacherAccount@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const { createTeacherAccount,teacherLogin } = require('./auth/teacherAuth')

app.post('/api/teacher/signUp', createTeacherAccount, createCookies)
app.post('/api/teacher/login', teacherLogin, createCookies)




app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true })
})







app.get('/', (req, res) => {
    return res.json({message: "This is a server # Don't mesh it up :( ",error:"Unauthorize Access"})
})

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };

const server = https.createServer(options,app)
server.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log(server.address());
    console.log('running at http://' + host + ':' + port)
} 
);

 
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});