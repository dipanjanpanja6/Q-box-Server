const admin = require('firebase-admin')
const firebase = require('firebase')


var firebaseConfig = {
    apiKey: "AIzaSyAx6rgXxW7VsoiwQuakaGgpST8sot7NiSo",
    authDomain: "iam-dipanjan.firebaseapp.com",
    databaseURL: "https://iam-dipanjan.firebaseio.com",
    projectId: "iam-dipanjan",
    storageBucket: "iam-dipanjan.appspot.com",
    messagingSenderId: "254603575786",
    appId: "1:254603575786:web:04d1cf35aba8e3c23bf293",
    measurementId: "G-27P9546LDP"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig); 


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://iam-dipanjan.firebaseio.com"
});
module.exports = { admin }





