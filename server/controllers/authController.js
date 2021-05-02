const pool = require('../db')
var bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator') 
const jwt = require('jsonwebtoken')
const config = require('config')

const secret = config.get("secret")
const generateAccessToken = (id, role) => {
    const payload = {
        id,
        role
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
} 

class authController {
    async registration(req, res) {
        try {
            const errors = validationResult(req) //Функция принимает запрос, выцепляет из него нужные строки и возвращает массив с ошибками
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Ошибка при регистрации', errors})
            }
            const {email, name, password} = req.body //Берём логин и пароль из тела запроса
            const candidate = await pool.query("SELECT email FROM users WHERE email = $1", [email])
            if (candidate.rows[0]) {
                return res.status(400).json({message: 'Пользователь с таким email уже существует'})
            } 
            const hashPassword = bcrypt.hashSync(password, 5)
            const user = await pool.query("INSERT INTO users (email, name, password) VALUES ($1, $2, $3)", [email, name, hashPassword])
            res.json({message: `Пользователь с email ${email} создан`})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error'})
        }
    }
    
    async login(req, res) {
        try {
            const {email, password} = req.body //Берём логин и пароль из тела запроса
            const user = await pool.query("SELECT user_id, email, name, password, role FROM users WHERE email = $1", [email])
            if (!user.rows[0]) {
                return res.status(400).json({message: `Пользователь с email ${email} не найден`})
            } 
            const hashedPassword = user.rows[0].password
            const validPassword = bcrypt.compareSync(password, hashedPassword)
            if (!validPassword) {
                return res.status(400).json({message: 'Пароль неверен'})
            }
            const {user_id, role} = user.rows[0]
            const token = generateAccessToken(user_id, role)     
            res.json({token})     
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Login error'})
        }
    }

        async getUsers(req, res) {
        try {
            const users = await pool.query("SELECT name, role FROM users")
            res.json(users.rows)
        } catch (e) {
            console.log(e);
        }        
    }

}

module.exports = new authController()