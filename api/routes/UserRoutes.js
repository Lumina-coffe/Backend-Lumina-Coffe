const express = require('express')
const { getUsers, createUser} = require('../controller/UsersController')

const router = express.Router()

router.post('/', createUser)
router.get('/', getUsers)

module.exports = router