const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')
const dateFormat = require('dateformat')

var now = new Date();
var dates = dateFormat(now, "ddd");
var times = dateFormat(now, " h:MM TT");
var createdAt = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")


exports.signUp = (req, res, next) => {

    const userEmailId = req.body.userEmail
    const userPassword = req.body.conPass

    const userName = req.body.userName
    const userPhoneNumber = req.body.ph
    const fkUserRoleId = req.body.fkUserRoleId

    console.log(userEmailId, userPassword, userName);
    if (fkUserRoleId !== 3) { return res.json({ error: true, message: 'Unauthorized Access' }) }

    if (userEmailId == "" || userPassword == "" || userName == "") return res.json({ error: true, message: "First input your credential" })

    firebase.auth().createUserWithEmailAndPassword(userEmailId, userPassword).then(d => {
        console.log(d.user.uid);
        admin.firestore().doc(`/students/${d.user.uid}`).set({
            userName,
            userPhoneNumber,
            userEmailId,
            createdAt: createdAt,
            uid: d.user.uid,
            isActivated: false,
        })

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                req.token = idToken
                req.user = ({ uid: d.user.uid, email: userEmailId, name: userName, isActivated: false, success: true })
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
        } else if (errorCode == 'auth/invalid-email') {
            return res.json({ error: true, message: 'Please enter a valid email address' });
        } else {
            return res.json({ error: true, message: errorMessage });
        }
    });
}

exports.login = (req, res, next) => {
    const userEmailId = req.body.userEmailId
    const userPassword = req.body.userPassword
    console.log(userEmailId, userPassword);

    if (userEmailId == "" || userPassword == "") return res.json({ error: true, message: "First input your credential" })
    firebase.auth().signInWithEmailAndPassword(userEmailId, userPassword).then(d => {

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                console.log(d.user.uid);

                admin.firestore().collection('students').where('uid', '==', d.user.uid).limit(1).get().then(data => {
                    if (data.empty) {
                        return res.json({ error: true, message: 'Something went wrong.' })
                        // admin.firestore().doc(`/students/${d.user.uid}`).set({userEmailId:userEmailId});
                        // req.user = ({ uid: d.user.uid, email: d.user.email, success: true, isActivated: false })
                        // req.token = idToken
                        // return next()
                    } else {

                        req.user = ({ isActivated: data.docs[0].data().isActivated, name: data.docs[0].data().userName, email: data.docs[0].data().userEmailId, uid: d.user.uid, success: true })
                        req.token = idToken
                        return next()
                    }
                }).catch((error) => {
                    console.log(error);
                    return res.json({ error: true, message: error })
                });

            })
            .catch((error) => {
                console.log(error);
                return res.json({ error: true, message: error })
            });

    }).catch(function (error) {
        console.log(error);
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/wrong-password') {
            return res.json({ error: true, message: 'Invalid Email Address or Password' });
        } else if (errorCode == 'auth/user-not-found') {
            return res.json({ error: true, message: 'Invalid Email Address or Password' });

        } else {
            return res.json({ error: true, message: errorMessage });
        }
    });
}





exports.createCookies = (req, res) => {

    // Set session expiration to 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const idToken = req.token
    const user = req.user
    admin.auth().createSessionCookie(idToken, { expiresIn })
        .then((sessionCookie) => {

            // Set cookie policy for session cookie.
            const options = { maxAge: expiresIn, httpOnly: true, signed: true };
            res.cookie('token', sessionCookie, options);
            console.log('cookies set');

            return res.json(user)
        }, error => {
            console.log(error);

            return res.status(401).json({ error: true, message: 'REQUEST FAILED! UNAUTHORIZED  );' });
        });
}

exports.checkUser = (req, res, next) => {

    const sessionCookie = req.signedCookies.token || '';
// console.log(sessionCookie);

    admin.auth().verifySessionCookie(
        sessionCookie, true /** checkRevoked */)
        .then((decodedClaims) => {
            // console.log(decodedClaims);

            req.uid = (decodedClaims.uid)
            req.email = (decodedClaims.email)

           return next()
        })
        .catch(error => {
            console.log(error.code);
            return res.json({ error: true, message: error.code })
        });
}
