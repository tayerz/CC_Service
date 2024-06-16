const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'lens-food-project',
  keyFilename: './lens-food-project-24aa998350a1.json',
});

const bucketName = 'lensfood-db';

module.exports = { storage, bucketName };