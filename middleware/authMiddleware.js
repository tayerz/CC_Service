const { admin } = require('../config/firebase'); // Adjust the path as necessary

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(403).send({ message: 'Tidak ada token yang diberikan.' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(403).send({ message: 'Tidak dapat memverifikasi token.' });
  }
};

module.exports = verifyToken;