const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    url: {
        type: String,
        require: true
    },
    cloudinaryId: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("File", fileSchema)