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
    // const userPhoneNumber= req.body.userPhoneNumber
    const fkUserRoleId = req.body.fkUserRoleId


    console.log(userEmailId, userPassword, userName);
    if (fkUserRoleId !== 9) { return res.json({ error: true, message: 'Unauthorized Access' }) }

    if (userEmailId == "" || userPassword == "" || userName == "") return res.json({ error: true, message: "First input your credential" })

    firebase.auth().createUserWithEmailAndPassword(userEmailId, userPassword).then(d => {
        console.log(d.user.uid);
        admin.firestore().doc(`/teacher/${d.user.uid}`).set({
            userName,
            // userPhoneNumber,
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
                        admin.firestore().doc(`/teacher/${d.user.uid}`).set(userEmailId);
                        req.user = ({ uid: d.user.uid, email: d.user.email, success: true, })
                        req.token = idToken
                        return next()
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
if(errorCode=='auth/user-not-found'){
    return res.json({ error: true, message: 'User Not Found' });

}else{
    return res.json({ error: true, message: errorMessage });
}

    });


}