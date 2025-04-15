const express = require('express')
const router = express.Router()
const { register, signIn, getUser, logout, getStatus} = require('../controller/AuthController')

router.get('/users', getUser)
router.get('/status', getStatus)
router.post('/register', register) 
router.post('/signin', signIn)
router.post('/logout', logout)

module.exports = router