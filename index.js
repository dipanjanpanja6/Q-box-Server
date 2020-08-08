const express = require('express')
const cross = require('cors')
require('dotenv').config();
const useragent = require('express-useragent')
const fileUpload = require('express-fileupload')
const fs = require('fs');
const http = require('http')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 7000;

var app = express()

var whitelist = [

  'https://qrioctybox.com',
  'https://www.qrioctybox.com',

  'https://tutor.qrioctybox.com',

  'https://quality.qrioctybox.com',

  'http://localhost',
  'http://localhost:3000',
  
]

app.use(cross({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }, credentials: true
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("cookies_secret_##$$123@@")); 

// ############################StudentAccount################################

const { createCookies, signUp, login, checkUser } = require('./auth/studentAuth')

app.post('/api/signUp', signUp, createCookies)
app.post('/api/login', login, createCookies)



// @@@@@@@@@@@@@@@@@@@@@@@@@@TeacherAccount@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

const { createTeacherAccount, teacherLogin, teacherQuestionUpload, checkTeacher } = require('./auth/teacherAuth')

app.post('/api/teacher/signUp', createTeacherAccount, createCookies)
app.post('/api/teacher/login', teacherLogin, createCookies)
app.post('/api/teacher/upload', checkUser, teacherQuestionUpload)

const {createWeeklyTest,createMonthlyTest, getCourse, getStreamByCourseName, getSubject, uploadVideoQBank, uploadVideoQBook,  } = require('./course/course');

app.get('/api/course', getCourse)
app.post('/api/getstream', getStreamByCourseName)
app.post('/api/getsubject', getSubject) 


app.post('/api/upload/qbank', checkTeacher, uploadVideoQBank)
app.post('/api/upload/qbook', checkTeacher, uploadVideoQBook)


app.post('/api/upload/weekly-test', checkTeacher, createWeeklyTest)
app.post('/api/upload/monthly-test', checkTeacher, createMonthlyTest)  


app.post('/api/teacher/checkUser', checkTeacher, (req, res) => {
  return res.json({ success: true })
})
app.post('/api/teacher/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true })
})

// ############################AdminAccount################################ 
const { AdminLogin } = require('./auth/adminAuth');

app.post('/api/admin/login', AdminLogin, createCookies)
// app.post('/api/admin/check', AdminLogin, createCookies )

// =======================================================================
// ############################AdminAccount################################
// const { AdminLogin } = require("./auth/adminAuth");
const {
  getQbookQuestion,
  getQbankkQuestion,
  getWeeklyTextQuestion,
  getMonthlyTextQuestion,
  getQuestionToView,
  ApproveQuestion,
  RejectQuestion,
  getQbookRejectedQuestion,
  getQbankkRejectedQuestion,
  getWeeklyTextRejectedQuestion,
  getMonthlyTextRejectedQuestion,
  getTeacherInfo,
  getTeacherQbookRejectedQuestion,
  deleteTeacherQbookRejectedQuestion,
} = require("./course/course");

// app.post("/api/admin/login", AdminLogin, createCookies);
// app.post('/api/admin/check', AdminLogin, createCookies )
app.get("/api/course/admin/getqbookquestion", getQbookQuestion);
app.get("/api/course/admin/getqbankquestion", getQbankkQuestion);
app.get("/api/course/admin/getweeklytestquestion", getWeeklyTextQuestion);
app.get("/api/course/admin/getmonthlytestquestion", getMonthlyTextQuestion);

// GET SINGLE QUESTION
app.get("/api/course/admin/getquestion/:collect/:qid", getQuestionToView);
app.get("/api/course/admin/approvequestion/:collect/:qid", ApproveQuestion);
app.post("/api/course/admin/rejectquestion/:collect/:qid", RejectQuestion);

// GETTING REJECTED QUESTION
app.get("/api/course/admin/getqbookrejectedquestion", getQbookRejectedQuestion);

app.get("/api/course/teacher/getqbookrejectedquestion",checkTeacher, getTeacherQbookRejectedQuestion);
app.delete("/api/course/teacher/getqbookrejectedquestion/:id",checkTeacher, deleteTeacherQbookRejectedQuestion);

app.get("/api/course/admin/getqbankkrejectedquestion", getQbankkRejectedQuestion);
app.get(
  "/api/course/admin/getweeklyrejectedquestion",
  getWeeklyTextRejectedQuestion
);
app.get(
  "/api/course/admin/getmonthlyrejectedquestion",
  getMonthlyTextRejectedQuestion
);
app.get("/api/course/admin/getteacherinfo/:tid", getTeacherInfo);


// ===========================================================================








/////////////////////////////////

app.post('/api/checkUser', checkUser, (req, res) => {
  return res.json({ success: true })
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true })
})





app.get('/', (req, res) => {
  return res.json({ message: "This is a server # Don't mesh it up :( ", error: "Unauthorize Access" })
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
