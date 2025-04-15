const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("terkoneksi");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
