const cloudinary = require('../config/cloudinary')
const File = require('../models/File')

exports.uploadFiles = async (req, res) =>{
    try{
        const result = await cloudinary.uploader.upload(req.file.path)

        const file = new File({
            name: req.file.originalname,
            url: result.secure_url,
            cloudinary: result.public_id
        })
        await file.save()
        res.status(201).json(file)

    }catch(error){
        console.log(error)
        res.status(500).json({message: "server error"})
    }
}