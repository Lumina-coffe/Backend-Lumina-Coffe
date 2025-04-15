const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

//create jwt
const generateToken = (id) => {
    return jwt.sign({id} , process.env.JWT_SECRET, {
        expiresIn: '1h',
    })
}

exports.getUser= async (req, res) => {
    try {
        const users = await User.find({}); // Jangan tampilkan password
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data user' });
    }
};

//register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        // Cek apakah user sudah ada
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Hash password sebelum disimpan
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Simpan user baru
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user" // Default role adalah user
        })

        await newUser.save()

        res.status(201).json({ message: "User registered successfully" })

    } catch (error) {
        res.status(500).json({ error: "Failed to register user" })
    }
}

//sign in login
exports.signIn= async (req, res) => {
    console.log('req', req.body)
    const {email, password}= req.body

    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message: "User not found"})
        }

//verifikasi password
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch){
            return res.status(401).json({message: "invalid cridential"})
        }

//buat token 
        res.json({
            _id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            token: generateToken(user._id)
        })

    }catch(error){
        res.status(500).json({error: "Gagal upload file"})
    }
}

const blacklist = []
//logut
exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token tidak ditemukan!" });
        }

        const token = authHeader.split(" ")[1]; // Ambil token setelah "Bearer"
        blacklist.push(token); // Simpan token ke blacklist

        res.json({ message: "Logout berhasil!" });
    } catch (error) {
        res.status(500).json({ message: "Gagal logout" })
    }
}

exports.getStatus = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token tidak ditemukan!" });
        }

        const token = authHeader.split(" ")[1];

        // Periksa apakah token ada di blacklist (sudah logout)
        if (blacklist.includes(token)) {
            return res.status(401).json({ message: "Token tidak valid (sudah logout)" });
        }

        // Verifikasi token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password"); // Jangan tampilkan password

        if (!user) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        res.json({
            isAuthenticated: true,
            user
        });
    } catch (error) {
        return res.status(401).json({ message: "Token tidak valid atau sesi telah berakhir" });
    }
};