const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('./cloudinary'); // Path dari file cloudinary.js kamu

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('File harus berupa gambar!'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
