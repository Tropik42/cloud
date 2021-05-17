const express = require('express')
const config = require('config')
const routes = require('./routes')
const cors = require('cors')

const app = express()
const PORT = config.get("serverPort")

app.use(cors())
app.use(express.json()) 

app.use('/auth', routes.auth)
app.use('/files', routes.files)

const start = () => {
    try {
        app.listen(PORT, () => console.log(`Старт сервера на порту ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()