const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController')
const {check} = require('express-validator')
// const authMiddleware = require('../middleware/authMiddleware')
// const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/registration', [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Пароль должен содержать больше 4 и меньше 9 символов').isLength({min: 4, max: 9})
],
controller.registration)
router.post('/login', controller.login)
// router.get('/users', roleMiddleware('USER'), controller.getUsers)

module.exports = router
