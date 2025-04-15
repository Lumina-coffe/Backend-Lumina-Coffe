const express = require('express');
const { createTransaction, getTransaction } = require('../controller/TransactionController');  // Pastikan path ini benar

const router = express.Router();

// Route untuk membuat transaksi
router.post('/', createTransaction);



// Route untuk menerima status transaksi dari Midtrans
router.post('/transaction-status', (req, res) => {
    // Menangani notifikasi dari Midtrans (Webhook)
    // Pastikan untuk memanggil controller yang tepat untuk memproses status transaksi
    console.log('Received webhook from Midtrans:', req.body);
    // Anda dapat memproses transaksi status di sini sesuai dengan apa yang diterima dari Midtrans.
    res.status(200).send('OK');
});

module.exports = router;
