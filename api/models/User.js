const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "name is require"],
  },
  email: {
    type: String,
    require: [true, "email is require"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "password is require"],
  },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});

// Hash password sebelum menyimpan user baru
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metode untuk membandingkan password yang dimasukkan dengan yang tersimpan
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
