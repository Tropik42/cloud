const fileService = require('../services/fileService')
const pool = require('../db')

class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            const file = await pool.query
            ("INSERT INTO files (name, type, parent, user_id) VALUES($1, $2, $3, $4)", [name, type, parent, user.id])
            const parentFile = await pool.query
            ("SELECT * FROM files WHERE file_id = $1", [parent])
            if(!parentFile) {
                file.path = name
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile}\\${file.name}`
                await fileService.createDir(file)
            }
            return res.json(file)
        } catch (e) {
            console.log(e)
            return res.status(400).json(e)
        }
    }
}

module.exports = new FileController()