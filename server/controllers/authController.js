const pool = require('../db')
var bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator') 
const jwt = require('jsonwebtoken')
const config = require('config')
const fileService = require('../services/fileService')

const secret = config.get("secret")
const generateAccessToken = (id) => {
    const payload = {
        id
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
            const user = await pool.query("INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *", [email, name, hashPassword])
            const user_id = user.rows[0].user_id
            const file = await pool.query("INSERT INTO files (name, type, user_id) VALUES($1, $2, $3) RETURNING *", [user_id, 'dir', user_id])
            const fileInfo = file.rows[0]
            await fileService.createDir(fileInfo)
            res.json({fileInfo, message: `Пользователь с email ${email} создан`})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Registration error'})
        }
    }
    
    async login(req, res) {
        try {
            const {email, password} = req.body //Берём логин и пароль из тела запроса
            const user = await pool.query("SELECT user_id, email, name, password, role, diskspace, usedspace, avatar FROM users WHERE email = $1", [email])
            const result = user.rows[0]
            if (!result) {
                return res.status(400).json({message: `Пользователь с email ${email} не найден`})
            } 
            const hashedPassword = user.rows[0].password
            const validPassword = bcrypt.compareSync(password, hashedPassword)
            if (!validPassword) {
                return res.status(400).json({message: 'Пароль неверен'})
            }
            const {user_id, role} = user.rows[0]
            const token = generateAccessToken(user_id, role)     
            res.json({
                token,
                user: {
                    id: result.user_id,
                    email: result.email,
                    diskSpace: result.diskspace,
                    usedSpace: result.usedspace,
                    avatar: result.avatar
                }
            })     
            console.log('Залогинился, получил ебучий токен', token);
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Login error'})
        }
    }

    async auth(req, res) {
        try {
            const id = req.user.id //Берём id из decoded в auth.middleware
            const user = await pool.query("SELECT user_id, email, name, password, role, diskspace, usedspace, avatar FROM users WHERE user_id = $1", [id])
            const result = user.rows[0]           
            const {user_id} = result
            const token = generateAccessToken(user_id)     
            res.json({
                token,
                user: {
                    id: result.user_id,
                    email: result.email,
                    diskSpace: result.diskspace,
                    usedSpace: result.usedspace,
                    avatar: result.avatar
                }
            })     
            console.log(result);
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