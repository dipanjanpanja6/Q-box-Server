const { admin } = require('../config/admin')
const firebase = require('firebase')
const randomId = require('random-id')

exports.signUp = (req, res, next) => {

    const email = req.body.userName
    const pass = req.body.password
    const name = req.body.name

    console.log(email, pass, name);

    if (userName == "" || password == "" || name == "") return res.json({ error: true, message: "First input your credential" })

    firebase.auth().createUserWithEmailAndPassword(email, pass).then(d => {
        console.log(d.user.uid);
        admin.firestore().doc(`/users/${d.user.uid}`).set({
            name,
            email,
            createdAt: new Date().toISOString(),
            uid: d.user.uid,
            isActivated: false,
        })

        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
                req.token = idToken
                req.user = ({ uid: d.user.uid, email: email, name: name, isActivated: false, success: true })
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