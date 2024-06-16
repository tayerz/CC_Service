require('dotenv').config();
const tf = require('@tensorflow/tfjs');
const fs = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');
const { admin, firestore, auth } = require('../config/firebase');

const modelParameter = {
    MODEL_URL: 'https://storage.googleapis.com/lensfood-db/from_saved_model/model.json',
    IMG_SIZE: 224,
    PRED_CLASS: require('../predClass.json'),
    CLASS_TO_SHOW: 10
};

async function loadModel() {
    const model = await tf.loadGraphModel(modelParameter.MODEL_URL);
    console.log("Model loaded successfully");
    return model;
}

async function doPrediction(imgPath, idToken, calories) {
    try {
        const model = await loadModel();

        // Load image from file path
        const imageBuffer = await fs.readFile(imgPath);
        const img = await loadImage(imageBuffer);

        // Create a canvas and draw the image on it
        const canvas = createCanvas(modelParameter.IMG_SIZE, modelParameter.IMG_SIZE);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, modelParameter.IMG_SIZE, modelParameter.IMG_SIZE);

        // Preprocess the image: convert to tensor and normalize
        const tensor = tf.browser.fromPixels(canvas)
            .resizeNearestNeighbor([modelParameter.IMG_SIZE, modelParameter.IMG_SIZE])
            .toFloat()
            .expandDims();

        // Normalize the image
        const normalizedTensor = tensor.div(tf.scalar(255));

        // Perform prediction
        const prediction = await model.predict(normalizedTensor).data();

        // Process prediction results
        const topPredictions = Array.from(prediction)
            .map((p, i) => ({
                probability: p,
                className: modelParameter.PRED_CLASS[i]
            }))
            .sort((a, b) => b.probability - a.probability)
            .slice(0, modelParameter.CLASS_TO_SHOW);

        console.log("Prediction result: ", topPredictions);

        // Verify ID token and get UID from the token
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // Save prediction and calories to Firestore
        const docRef = await firestore.collection('predictions').add({
            userId: userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            predictions: topPredictions,
            calories: calories // Add calories to the document
        });

        console.log("Prediction saved with ID: ", docRef.id);

        return topPredictions;
    } catch (error) {
        console.error("Error during prediction", error);
        throw error;
    }
}

module.exports = {
    doPrediction,
};