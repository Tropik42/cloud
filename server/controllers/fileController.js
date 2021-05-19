const fileService = require('../services/fileService')
const pool = require('../db')

class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            let file
            if (!parent) {
                file = await pool.query
                ("INSERT INTO files (name, type, parent, user_id) VALUES($1, $2, $3, $4) RETURNING *", [name, type, req.user.id, req.user.id])
            } else {
                file = await pool.query
                ("INSERT INTO files (name, type, parent, user_id) VALUES($1, $2, $3, $4) RETURNING *", [name, type, parent, req.user.id])
            }
            const fileInfo = file.rows[0] 
            // console.log(fileInfo);
            let parentFile
            if (parent) {
                const queryParentFile = await pool.query("SELECT name FROM files WHERE file_id = $1", [parent])
                parentFile = queryParentFile.rows[0].name
                // console.log(parentFile)
            }
            if(!parent) {
                fileInfo.path = name
                await fileService.createDir(fileInfo)
            } else {
                fileInfo.path = `${parentFile}\\${fileInfo.name}`
                await fileService.createDir(fileInfo)
            }
            file = file.rows[0]
            console.log('file = ', file);
            return res.json(file)
        } catch (e) {
            console.log(e)
            return res.status(400).json(e)
        }
    }

    async fetchFiles(req, res) {
        try {
            const {file_id, name, parent} = req.query
            let files
            if (!parent) {
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [req.user.id])
            } else {
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [parent])
            }
            files = files.rows
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Can not get files"})
        }
    }
}

module.exports = new FileController()