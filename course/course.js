const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')

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
  // console.log(36, ID);

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






exports.createQBookTopic = (req, res) => {
  const id = req.id
  let data = JSON.parse(req.body.document)

  // if (data.noImage === false) {
  //   data.image_uri = req.image_uri
  // }
  if (data.noVideo === false) {
    data.video_uri = req.video_uri
  }
  data.createdAt = createdAt
  data.uid = req.uid
  data.key = id
  admin.firestore().collection("QBook").doc().set(data).then(async data => {

    console.log(data);

    return res.json({ ok: data })

  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  })
 
}
exports.uploadVideoQB = (req, res, next) => {
  const data = JSON.parse(req.body.document)
  const image_id = randomId(10, 'Aa0')
  if (data.noVideo === false) {

    const files = req.files.video;
    // console.log(files);
    const mimetype = files.mimetype;
    const type = mimetype.split("/")[0];

    if (type == "video") {
      const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: SECRET,
      });

      const file = {
        Bucket: BUCKET_NAME_VID,
        Key: `QBook/${image_id}`,
        Body: files.data,
        Metadata: {
          'Content-Type': mimetype
        }
      };

      s3.upload(file, async (error, response) => {
        if (error) { return res.status(405).json({ error: true, message: "Video upload failed", id: error }); }
        else if (response == "") { return res.status(405).json({ error: true, message: "Video upload failed" }); }
        else {
          var file_url = await response.Location;
          console.log(file_url);
          req.video_uri = file_url;
          req.id = image_id
          return next()
        }
      });
    } else {
      return res.json({ error: true, message: 'Video file is not a Video file' })
    }
  } else {
    req.id = image_id
    return next()
  }
}



exports.createQuestion = (req, res) => {
  const id = req.id
  let data = JSON.parse(req.body.document)

  if (data.noImage === false) {
    data.image_uri = req.image_uri
  }
  if (data.noVideo === false) {
    data.video_uri = req.video_uri
  }
  data.createdAt = createdAt
  data.uid = req.uid
  data.key = id
  admin.firestore().collection("Qbank").doc().set(data).then(async data => {

    console.log(data);

    return res.json({ ok: data })

  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  })
 
}
exports.uploadVideo = async(req, res, next) => {
  const data = JSON.parse(req.body.document)
  const image_id =randomId(32, "aA0");
  req.id = image_id;

  if (data.noVideo === false) {

    const files = req.files.video;
    // console.log(files);
    const mimetype = files.mimetype;
    const type = mimetype.split("/")[0];

    if (type == "video") {
      const s3 = new AWS.S3({
        accessKeyId: ID,
        secretAccessKey: SECRET,
      });

      const file = {
        Bucket: BUCKET_NAME_VID,
        Key: `questions/${image_id}`,
        Body: files.data,
        Metadata: {
          'Content-Type': mimetype
        }
      };

      s3.upload(file, async (error, response) => {
        if (error) { return res.status(405).json({ error: true, message: "Video upload failed", id: error }); }
        else if (response == "") { return res.status(405).json({ error: true, message: "Video upload failed" }); }
        else {
          var file_url = await response.Location;
          // console.log(response);
          req.video_uri = file_url;

          return next()
        }
      });
    } else {
      return res.json({ error: true, message: 'Video file is not a Video file' })
    }
  } else {

    return next()
  }
}
// exports.uploadImage = (req, res, next) => {
//   const data = JSON.parse(req.body.document)
//   if (data.noImage === false) {

//     const files = req.files.image;
//     // console.log(files);
//     const mimetype = files.mimetype;
//     const type = mimetype.split("/")[0];
//     const image_id = randomId(32, "aA0");

//     if (type == "image") {

//       const s3 = new AWS.S3({
//         accessKeyId: ID,
//         secretAccessKey: SECRET,
//       });

//       const file = {
//         Bucket: BUCKET_NAME_PIC,
//         Key: `questions/${image_id}`,
//         Body: files.data,
//         Metadata: {
//           'Content-Type': mimetype
//         }
//       };

//       s3.upload(file, async (error, response) => {
//         if (error) { return res.status(405).json({ error: true, message: "Image upload failed", id: error }); }
//         else if (response == "") { return res.status(405).json({ error: true, message: "Image upload failed" }); }
//         else {
//           var file_url = await response.Location;
//           // console.log(response);
//           req.image_uri = file_url;
//           req.id = image_id
//           return next()
//         }
//       });
//     } else {
//       return res.json({ error: true, message: 'Image file is not a image file' })
//     }
//   } else {
//     req.id = image_id
//     return next()
//   }
// }



exports.createMonthlyTest = (req, res) => { 
  let data = req.body.data

  console.log(data);

  data.createdAt = createdAt
  data.uid = req.uid 
  data.approve=false
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
  data.approve=false
  admin.firestore().collection("WeeklyTest").doc().set(data).then(async data => {
    return res.json({ success: true })
  }).catch((error) => {
    console.log(error);
    return res.json({ error: true, message: error })
  })
 
}