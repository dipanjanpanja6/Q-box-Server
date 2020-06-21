const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')

var now = new Date();
var dates = dateFormat(now, "ddd");
var times = dateFormat(now, " h:MM TT");
var createdAt = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
var db = admin.firestore()


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

exports.getStream = async (req, res) => {
   const ID=req.params.id
//    console.log(ID);
   
    await admin.firestore().collection('stream').where('course','array-contains',ID).get().then(async data => {
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


