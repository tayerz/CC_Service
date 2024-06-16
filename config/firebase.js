require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.GCS_BUCKET_NAME
  });

//Access Firebase services
const firestore = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

// Export the Firebase Admin SDK modules
module.exports = {
    admin,
    firestore,
    auth
};