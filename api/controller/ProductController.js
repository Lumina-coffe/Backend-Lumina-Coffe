const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

// Fungsi format Rupiah
const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(value);
};

// Ambil semua produk
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        const formattedProducts = products.map((product) => ({
            ...product._doc,
            formattedPrice: formatRupiah(product.price),
        }));

        res.status(200).json(formattedProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ambil detail produk berdasarkan ID
exports.getDetailProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        const formattedProduct = {
            ...product._doc,
            formattedPrice: formatRupiah(product.price),
        };

        res.status(200).json(formattedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tambah produk baru
exports.createProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Thumbnail wajib diunggah.' });
        }

        const { name, description, price, stock } = req.body;

        const parsedPrice = parseFloat(price);
        const parsedStock = parseInt(stock);

        if (isNaN(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({ message: 'Harga harus berupa angka positif.' });
        }

        if (isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ message: 'Stok harus berupa angka positif.' });
        }

        const product = new Product({
            name,
            description,
            price: parsedPrice,
            stock: parsedStock,
            thumbnail: req.file.path,
            cloudinaryId: req.file.filename,
        });

        await product.save();

        const formattedProduct = {
            ...product._doc,
            formattedPrice: formatRupiah(product.price),
        };

        res.status(201).json(formattedProduct);
    } catch (error) {
        console.error("❌ Error saat membuat produk:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update produk
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        let imageData = {
            secure_url: product.thumbnail,
            public_id: product.cloudinaryId,
        };

        if (req.file) {
            if (product.cloudinaryId) {
                await cloudinary.uploader.destroy(product.cloudinaryId);
            }
            imageData = {
                secure_url: req.file.path,
                public_id: req.file.filename,
            };
        }

        const updatedFields = { ...req.body };

        if (req.body.price !== undefined) {
            const price = parseFloat(req.body.price);
            if (isNaN(price) || price < 0) return res.status(400).json({ message: 'Harga tidak valid' });
            updatedFields.price = price;
        }

        if (req.body.stock !== undefined) {
            const stock = parseInt(req.body.stock);
            if (isNaN(stock) || stock < 0) return res.status(400).json({ message: 'Stok tidak valid' });
            updatedFields.stock = stock;
        }

        updatedFields.thumbnail = imageData.secure_url;
        updatedFields.cloudinaryId = imageData.public_id;

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, { new: true });

        const formattedProduct = {
            ...updatedProduct._doc,
            formattedPrice: formatRupiah(updatedProduct.price),
        };

        res.status(200).json(formattedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hapus produk
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        if (product.cloudinaryId) {
            await cloudinary.uploader.destroy(product.cloudinaryId);
        }

        await product.deleteOne();
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};