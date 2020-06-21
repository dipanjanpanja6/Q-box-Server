const express = require('express')
const cross = require('cors')
const useragent = require('express-useragent')
const fileUpload = require('express-fileupload')
const fs = require('fs');
const http = require('http')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 7000;

var app = express()

var whitelist = ['http://qrioctybox.com', 'http://www.qrioctybox.com', 'http://208.109.12.146','http://localhost']
app.use(cross({
    origin: function(origin, callback){
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      if(whitelist.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },credentials: true
  }));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("cookies_secret_##$$123@@"));

// ############################StudentAccount################################

const { createCookies, signUp,login,checkUser } = require('./auth/studentAuth')

app.post('/api/signUp', signUp, createCookies)
app.post('/api/login', login, createCookies)



// @@@@@@@@@@@@@@@@@@@@@@@@@@TeacherAccount@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const { createTeacherAccount,teacherLogin,teacherQuestionUpload } = require('./auth/teacherAuth')

app.post('/api/teacher/signUp', createTeacherAccount, createCookies)
app.post('/api/teacher/login', teacherLogin, createCookies)
app.post('/api/teacher/login', checkUser,teacherQuestionUpload)

const {getCourse,getStream } = require('./course/course')

app.get('/api/course', getCourse)
app.get('/api/stream/:id', getStream)







app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ success: true })
})







app.get('/', (req, res) => {
    return res.json({message: "This is a server # Don't mesh it up :( ",error:"Unauthorize Access"})
})


const server = http.createServer(app)
server.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log(server.address()); 
} 
);

 
process.on('uncaughtException', function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});