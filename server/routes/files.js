const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware')
const fileController = require('../controllers/fileController')

// const roleMiddleware = require('../middleware/roleMiddleware')

router.post('', authMiddleware, fileController.createDir)
router.post('/upload', authMiddleware, fileController.uploadFile)
router.post('/avatar', authMiddleware, fileController.uploadAvatar)
router.get('', authMiddleware, fileController.fetchFiles)
router.get('/download', authMiddleware, fileController.downloadFile)
router.get('/search', authMiddleware, fileController.searchFile)
router.delete('/', authMiddleware, fileController.deleteFile)
router.delete('/avatar', authMiddleware, fileController.deleteAvatar)

module.exports = router
