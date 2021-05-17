const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware')
const fileController = require('../controllers/fileController')

// const roleMiddleware = require('../middleware/roleMiddleware')

router.post('', authMiddleware, fileController.createDir)

module.exports = router
