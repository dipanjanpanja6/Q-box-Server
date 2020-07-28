const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')

var now = new Date();
var dates = dateFormat(now, "ddd");
var times = dateFormat(now, " h:MM TT");
var createdAt = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")








exports.AdminLogin = (req, res, next) => {
    const userEmailId = req.body.userEmailId
    const userPassword = req.body.userPassword

    if (userEmailId == "" || userPassword == "") return res.json({ error: true, message: "First input your credential" })
    firebase.auth().signInWithEmailAndPassword(userEmailId, userPassword).then(d => {

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                console.log(d.user.uid);

                admin.firestore().collection('admin').where('uid', '==', d.user.uid).limit(1).get().then(data => {
                    if (data.empty) {
                        return res.json({ error: true, message: 'User not found' })

                    } else {

                        // req.user = ({ name: data.docs[0].data().userName, email: data.docs[0].data().userEmailId, uid: d.user.uid, success: true })
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




exports.checkAdmin = (req, res, next) => {

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