const express = require('express');
const { uploadFiles } = require('../controller/FileController');
const upload = require('../config/multer'); // ✅ Import multer dengan CloudinaryStorage

const router = express.Router();

// ✅ Pakai middleware CloudinaryStorage
router.post('/upload', upload.single('file'), uploadFiles);

module.exports = router;
