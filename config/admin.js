const admin = require('firebase-admin')
const firebase = require('firebase')


var firebaseConfig = {
  apiKey: "",
  projectId: "q-box-client-fa30b"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig); 


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://q-box-client-fa30b.firebaseio.com"
});
module.exports = { admin }





