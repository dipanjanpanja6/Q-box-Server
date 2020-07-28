const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')

var now = new Date();
var dates = dateFormat(now, "ddd");
var times = dateFormat(now, " h:MM TT");
var createdAt = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")







exports.createTeacherAccount = (req, res, next) => {

    const userEmailId = req.body.userEmailId
    const userPassword = req.body.userPassword
    const userName = req.body.userName
    const stream= req.body.stream
    const subject= req.body.subject
    const fkUserRoleId = req.body.fkUserRoleId


    console.log(userEmailId, userPassword, userName);
    if (fkUserRoleId !== 9) { return res.json({ error: true, message: 'Unauthorized Access' }) }

    if (userEmailId == "" || userPassword == "" || userName == "" || stream===[] || subject===[]) return res.json({ error: true, message: "First input your credential" })

    firebase.auth().createUserWithEmailAndPassword(userEmailId, userPassword).then(d => {
        console.log(d.user.uid);
        admin.firestore().doc(`/teacher/${d.user.uid}`).set({
            userName,
            // userPhoneNumber,
            stream,
            subject,
            userEmailId,
            createdAt: createdAt,
            uid: d.user.uid,
        })

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                req.token = idToken
                req.user = ({ uid: d.user.uid, email: userEmailId, name: userName, success: true })
                return next();
            })
            .catch((error) => {
                console.log(error);
                return res.json({ error: true, message: error })
            });

    }).catch(function (error) {
        console.log(error);

        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            return res.json({ error: true, message: 'The password is too weak. Use minimum 6 digit' });
        } else {
            return res.json({ error: true, message: errorMessage });
        }
    });
}


exports.teacherLogin = (req, res, next) => {
    const userEmailId = req.body.userEmailId
    const userPassword = req.body.userPassword
    console.log(userPassword, userEmailId);

    if (userEmailId == "" || userPassword == "") return res.json({ error: true, message: "First input your credential" })
    firebase.auth().signInWithEmailAndPassword(userEmailId, userPassword).then(d => {

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                console.log(d.user.uid);

                admin.firestore().collection('teacher').where('uid', '==', d.user.uid).limit(1).get().then(data => {
                    if (data.empty) {
                        return res.json({ error: true, message: 'User not found' })
                        // admin.firestore().doc(`/teacher/${d.user.uid}`).set(userEmailId);
                        // req.user = ({ uid: d.user.uid, email: d.user.email, success: true, })
                        // req.token = idToken
                        // return next()
                    } else {

                        req.user = ({ name: data.docs[0].data().userName, email: data.docs[0].data().userEmailId, uid: d.user.uid, success: true })
                        req.token = idToken
                        return next()
                    }
                })

            })
            .catch((error) => {
                console.log(error);
                return res.json({ error: true, message: error })
            });

    }).catch(function (error) {
        console.log(error);

        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/user-not-found') {
            return res.json({ error: true, message: 'User Not Found' });

        } else {
            return res.json({ error: true, message: errorMessage });
        }

    });


}



exports.teacherQuestionUpload = (req, res) => {
    const uid = req.uid
    const email = req.email

    const data = {
        id: randomId(10, 'Aa0'),
        uid: uid,
        email: email,
        title: req.body.title,
        gitLink: req.body.gitLink,
        desc: req.body.desc,
        imageUri: req.body.imageUri,
        liveLink: req.body.liveLink,
        createdAt: new Date().toLocaleString(),
        star: 0,
        member: [uid],
        tag: req.body.tag,
        status: req.body.status,
        active: req.body.active
    }
    // console.log(data);
    console.log(data.tag);
    // console.log(req.body.tag);


    var object = {}
    object['projectKey ' + randomId(5, 'Aa0')] = data

    admin.firestore().collection('project').doc().set(data).then(d => {

        return res.json({ success: true })
    }).catch((error) => {
        console.log(error);
        return res.json({ error: true, message: error })
    })
}






exports.checkTeacher = (req, res, next) => {

    const sessionCookie = req.signedCookies.token || '';
    // console.log(sessionCookie);
    if (sessionCookie === '' || sessionCookie === null) {
        return res.json({ error: true, message: 'not logged in' })
    }
    admin.auth().verifySessionCookie(
        sessionCookie, true /** checkRevoked */)
        .then((decodedClaims) => {
            // console.log(decodedClaims);

            admin.firestore().collection("teacher")
                .where("uid", "==", decodedClaims.uid).limit(1).get().then(d => {
                    if (d.empty) {
                        return res.json({ error: true, message: 'not logged in' })
                    } else {
                        req.uid = (decodedClaims.uid)
                        req.email = (decodedClaims.email)

                        return next()

                    }
                }).catch(r => {
                    console.log(r)
                    return res.json({ error: true, message: r.code })
                }
                )
        })
        .catch(error => {
            console.log(error);
            return res.json({ error: true, message: error.code })
        });
}