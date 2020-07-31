const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')
const Busboy = require('busboy')

var now = new Date();
var dates = dateFormat(now, "ddd");
var times = dateFormat(now, " h:MM TT");
var createdAt = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
var db = admin.firestore()

const AWS = require('aws-sdk');
const { firestore } = require('firebase-admin');

const ID = process.env.AWS_ACCESS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME_PIC = process.env.AWS_BUCKET_PIC;
const BUCKET_NAME_VID = process.env.AWS_BUCKET_VID;


exports.getCourse = async (req, res) => {

  await admin.firestore().collection("course")
    .orderBy("createdAt", "desc").get().then(async data => {
      if (data.empty) {
        return res.json({ error: true, message: 'Currently no courses available' })
      } else {
        var file = []
        await data.forEach(async d => {
          var sd = d.data()
          sd.ID = d.id
          file.push(sd)
        })
        return res.json({ success: true, data: file })
      }
    }).catch((error) => {
      console.log(error);
      return res.json({ error: true, message: error })
    });
}

exports.getStreamByCourseName = async (req, res) => {
  const ID = req.body.courseValue
  console.log(36, ID);

  await admin.firestore().collection("stream").where("course", "array-contains-any", ID).get().then(async data => {
    if (data.empty) {
      return res.json({ error: true, message: 'Currently no Stream available' })
    } else {
      var file = []
      await data.forEach(async d => {
        var sd = d.data()
        sd.ID = d.id
        file.push(sd)
      })
      return res.json({ success: true, data: file })
    }
  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  });
}

exports.getSubject = async (req, res) => {
  const ID = req.body.streamValue
  // console.log(ID);

  await admin.firestore().collection("subject").where("stream", "array-contains", ID).get().then(async data => {
    if (data.empty) {
      return res.json({ error: true, message: 'Currently no Subject available' })
    } else {
      var file = []
      await data.forEach(async d => {
        var sd = d.data()
        sd.ID = d.id
        file.push(sd)
      })
      return res.json({ success: true, data: file })
    }
  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  });
}





 
exports.uploadVideoQBook = async (req, res, next) => {
  var key = randomId(10, 'Aa0')
  var busboy = new Busboy({ headers: req.headers });

  var video_uri = ""
  var data = {}

  await busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET,
      params: { Bucket: BUCKET_NAME_VID, Key: `QBook/${key}`, Body: file, Metadata: { ContentType: mimetype, Filename: filename } },
      options: { partSize: 5 * 1024 * 1024, queueSize: 10 }   // 5 MB
    });
    s3.upload().on('httpUploadProgress', function (evt) {
    }).send(function (err, d) {
      // video_uri = d.Location 
      console.log(d.Location);
    });
  });

  await busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + val);
    data = JSON.parse(val)
  });

  busboy.on('finish', function () {
    console.log('Done parsing form!');
    data.createdAt = createdAt
    data.uid = req.uid
    data.approve = null
    data.key = key
    if (data.noVideo === false) {
      data.video_uri = `https://raw-video-qrioctybox.s3.amazonaws.com/QBook/${key}`
    }
    console.log(data);
    admin.firestore().collection("QBook").doc().set(data).then(data => {
      return res.json({ success: true })
    }).catch((error) => {
      console.log(error);
      return res.json({ error: true, message: error })
    })

  });

  req.pipe(busboy);

}

 
exports.uploadVideoQBank = async (req, res, next) => {

  var key = randomId(10, 'Aa0')
  var busboy = new Busboy({ headers: req.headers });

  var video_uri = ""
  var data = {}

  await busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var s3 = new AWS.S3({
      accessKeyId: ID,
      secretAccessKey: SECRET,
      params: { Bucket: BUCKET_NAME_VID, Key:`QBank/${key}`, Body: file, Metadata: { ContentType: mimetype, Filename: filename } },
      options: { partSize: 5 * 1024 * 1024, queueSize: 10 }   // 5 MB
    });
    s3.upload().on('httpUploadProgress', function (evt) {
    }).send(function (err, d) {
      // video_uri = d.Location 
      console.log(d.Location);
    });
  });

  await busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + val);
    data = JSON.parse(val)
  });

  busboy.on('finish', function () {
    console.log('Done parsing form!');
    data.createdAt = createdAt
    data.uid = req.uid
    data.approve = null
    data.key = key
    if (data.noVideo === false) {
      data.video_uri = `https://raw-video-qrioctybox.s3.amazonaws.com/QBank/${key}`
    }
    console.log(data);
    admin.firestore().collection("Qbank").doc().set(data).then(data => {
      return res.json({ success: true })
    }).catch((error) => {
      console.log(error);
      return res.json({ error: true, message: error })
    })
  });

  req.pipe(busboy);


}

exports.createMonthlyTest = (req, res) => {
  let data = req.body.data

  console.log(data);

  data.createdAt = createdAt
  data.uid = req.uid
  data.approve = null
  admin.firestore().collection("MonthlyTest").doc().set(data).then(async data => {


    return res.json({ success: true })

  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  })

}
exports.createWeeklyTest = (req, res) => {
  let data = req.body.data

  console.log(data);

  data.createdAt = createdAt
  data.uid = req.uid
  data.approve = null
  admin.firestore().collection("WeeklyTest").doc().set(data).then(async data => {
    return res.json({ success: true })
  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  })

}