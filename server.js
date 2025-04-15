const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./api/config/db');

// Inisialisasi App
const app = express();
dotenv.config();

// Koneksi ke MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const userRoutes = require('./api/routes/UserRoutes');
const productRoutes = require('./api/routes/ProductRoutes');
const fileRoutes = require('./api/routes/FileRouter');
const authRoutes = require('./api/routes/AuthRoutes');
const transactionRoutes = require('./api/routes/TransactionRoutes');

// Gunakan Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Internal Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Jalankan Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
