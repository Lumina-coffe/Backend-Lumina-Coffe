const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    stock: Number, // ✅ Tambahan field stok
    thumbnail: String,
    cloudinaryId: String,
    category: String,
    isSignature: Boolean,
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
