// ml_model_config.js

module.exports = {
    MODEL_URL: 'https://storage.googleapis.com/lensfood-db/MobileNetV3-L.tflite',
    IMG_SIZE: 224,
    PRED_CLASS: [
      "ayam bakar", "ayam goreng", "bakso", "bakwan", "batagor", "bihun", "capcay", "gado-gado", "ikan goreng",
      "kerupuk", "martabak telur", "mie", "nasi goreng", "nasi putih", "nugget", "opor ayam", "pempek", "rendang",
      "roti", "sate", "sosis", "soto", "steak", "tahu", "telur", "tempe", "terong balado", "tumis kangkung", "udang"
    ],
    CLASS_TO_SHOW: 10
  };
  