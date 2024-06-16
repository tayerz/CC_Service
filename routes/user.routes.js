const express = require('express');
const users = require('../controllers/user.controller');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Route to logout user
router.post('/logout', verifyToken, users.logoutProfile);

// Register and login routes
router.post('/register', users.registUser);
router.post('/login', users.loginUser);
router.post('/reset-password', users.resetPassword);

// Route to update user profile
router.put('/profile', verifyToken, users.updateProfile);

// Route to get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userRecord = await admin.auth().getUser(req.uid);
        res.status(200).send({ userRecord });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send({ message: 'Error fetching user profile.' });
    }
});

module.exports = router;
