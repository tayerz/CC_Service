require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Import fs.promises untuk menghapus file
const logic = require('./controllers/ml-logic');
const verifyToken = require('./middleware/authMiddleware');


const app = express();
const upload = multer({ dest: 'uploads/' }); // Folder untuk menyimpan file yang diunggah

// Middleware
app.use(cors());
app.use(express.json()); // Use express's built-in JSON parser

app.post('/predict', verifyToken, upload.single('image'), async (req, res) => {
    const filePath = req.file.path;
    const { calories } = req.body; // Ambil kalori dari body request
    const idToken = req.headers.authorization?.split('Bearer ')[1]; // Ambil ID token dari headers

    if (!idToken) {
        return res.status(403).send({ message: 'No token provided.' });
    }

    try {
        const result = await logic.doPrediction(filePath, idToken, calories);
        res.status(200).json({
            message: 'Predicted class:',
            result: result,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error during prediction',
            error: error.message,
        });
    } finally {
        // Hapus file setelah prediksi selesai
        await fs.unlink(filePath);
    }
});



app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hi There! Welcome to the ML Model API',
    });
});

// Routes
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});