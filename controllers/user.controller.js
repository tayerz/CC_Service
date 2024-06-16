const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, updateDoc } = require('firebase/firestore'); // Import Firestore
const { admin } = require('../config/firebase'); // Import admin from firebase.js

// Your Firebase configuration (if needed for client-side SDK)
const firebaseConfig = {
    apiKey: "Your-API-Key",
    authDomain: "Your-Auth-Domain",
    projectId: "Your-Project-ID",
    storageBucket: "Your-Storage-Bucket",
    messagingSenderId: "Your-Messaging-Sender-ID",
    appId: "Your-App-ID",
    measurementId: "Your-Measurement-ID"
};

// Initialize Firebase client-side SDK (if needed)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Get Firestore service

// Register User
exports.registUser = (req, res) => {
    const { email, password, height, weight, name } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required!" });
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
            updateProfile(user, {
                displayName: name
            }).then(() => {
                const userRef = doc(db, "users", user.uid);
                setDoc(userRef, {
                    email: email,
                    height: height,
                    weight: weight,
                    name: name
                })
                .then(() => {
                    user.getIdToken().then(idToken => {
                        res.status(201).send({
                            message: "User registered successfully",
                            userId: user.uid,
                            idToken: idToken,
                            refreshToken: user.refreshToken,
                            displayName: user.displayName
                        });
                    });
                })
                .catch((error) => {
                    res.status(500).send({ message: "Failed to add user data to Firestore: " + error.message });
                });
            }).catch((error) => {
                res.status(500).send({ message: "Failed to update user profile: " + error.message });
            });
        }
    })
    .catch((error) => {
        res.status(500).send({ message: error.message });
    });
};

// Login User
exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "Email and password are required!" });
    }

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        userCredential.user.getIdToken().then(idToken => {
            res.status(200).send({
                message: "User logged in successfully",
                userId: userCredential.user.uid,
                idToken: idToken,
                refreshToken: userCredential.user.refreshToken,
                displayName: userCredential.user.displayName
            });
        });
    })
    .catch((error) => {
        res.status(500).send({ message: error.message });
    });
};

exports.resetPassword = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send({ message: "Email is required!" });
    }

    sendPasswordResetEmail(auth, email)
    .then(() => {
        res.status(200).send({ message: "Password reset email sent successfully" });
    })
    .catch((error) => {
        res.status(500).send({ message: error.message });
    });
};

exports.logoutProfile = async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) return res.status(400).send({ message: 'No token provided.' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        await admin.auth().revokeRefreshTokens(decodedToken.uid);

        res.status(200).send({ message: 'User logged out successfully.' });
    } catch (error) {
        res.status(500).send({ message: 'Error logging out.', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { getAuth } = require('firebase-admin/auth');

    const idToken = req.headers.authorization?.split('Bearer ')[1]; // Extract the ID token from the Authorization header

    if (!idToken) {
        return res.status(401).send({ message: "Unauthorized" });
    }

    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const allowedUpdates = ['name', 'weight', 'height'];
        const updateData = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateData[key] = req.body[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: "No valid update fields provided" });
        }

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updateData);
        res.status(200).send({ message: "User profile updated successfully" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
// Get User Profile
// exports.getUserProfile = (req, res) => {
//     const user = req.user;
//     res.status(200).send({
//         message: "User profile retrieved successfully",
//         userId: user.uid,
//         displayName: user.displayName,
//         email: user.email,
//         height: user.height,
//         weight: user.weight
//     });
//};