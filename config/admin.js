const admin = require('firebase-admin')
const firebase = require('firebase')


var firebaseConfig = {
  apiKey: "AIzaSyB8FA_XLN3p61LjiodWTkOIVAKSqTbZRYw",
  authDomain: "q-box-client-fa30b.firebaseapp.com",
  databaseURL: "https://q-box-client-fa30b.firebaseio.com",
  projectId: "q-box-client-fa30b",
  storageBucket: "q-box-client-fa30b.appspot.com",
  messagingSenderId: "568701074451",
  appId: "1:568701074451:web:b1a46b75575325c13e93e6",
  measurementId: "G-W2FW4Z1H8J"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig); 


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://q-box-client-fa30b.firebaseio.com"
});
module.exports = { admin }





