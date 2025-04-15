const midtransClient = require('midtrans-client');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// GET all transactions
exports.getTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error.message);
        res.status(500).json({ message: 'Failed to retrieve transactions: ' + error.message });
    }
};

// POST create transaction
exports.createTransaction = async (req, res) => {
    try {
        const { first_name, amount, product_id, quantity } = req.body;

        if (!first_name || !amount || !product_id || !quantity) {
            return res.status(400).json({ message: "All fields (first_name, amount, product_id, quantity) are required." });
        }

        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: "Stok tidak mencukupi." });
        }

        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVERKEY
        });

        const order_id = "ORDER-" + new Date().getTime();

        const parameter = {
            transaction_details: {
                order_id,
                gross_amount: amount
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name,
            },
            callbacks: {
                finish: `http://localhost:5173/success-payment/${product_id}`,
            },
        };

        const transaction = await snap.createTransaction(parameter);
        const snapToken = transaction.token;

        // Update stok & simpan transaksi
        product.stock -= quantity;
        product.sold += quantity;
        await product.save();

        const newTransaction = new Transaction({
            first_name,
            amount,
            product_id,
            transaction_id: order_id,
            midtrans_token: snapToken,
            status: 'pending' // Default
        });

        await newTransaction.save();

        res.status(200).json({
            message: 'Transaction created successfully',
            snapToken,
            order_id
        });

    } catch (error) {
        console.error("Error during transaction creation:", error.message);
        res.status(500).json({ message: "Transaction creation failed: " + error.message });
    }
};

// POST handle notification from Midtrans
exports.handleNotification = async (req, res) => {
    try {
        const notificationJson = req.body;

        const core = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVERKEY,
            clientKey: process.env.MIDTRANS_CLIENTKEY,
        });

        const statusResponse = await core.transaction.notification(notificationJson);

        const { order_id, transaction_status } = statusResponse;

        const transaction = await Transaction.findOne({ transaction_id: order_id });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.status = transaction_status;
        await transaction.save();

        res.status(200).json({ message: 'Notification handled', status: transaction_status });

    } catch (error) {
        console.error("Notification error:", error.message);
        res.status(500).json({ message: 'Notification failed: ' + error.message });
    }
};

// GET check status manual
exports.checkTransactionStatus = async (req, res) => {
    const { orderId } = req.params;

    const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVERKEY
    });

    try {
        const statusResponse = await snap.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;

        const transaction = await Transaction.findOne({ transaction_id: orderId });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.status = transactionStatus;
        await transaction.save();

        res.status(200).json({ status: transactionStatus });
    } catch (error) {
        console.error("Error checking transaction status:", error.message);
        res.status(500).json({ message: 'Failed to check status: ' + error.message });
    }
};
