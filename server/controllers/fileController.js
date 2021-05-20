const fileService = require('../services/fileService')
const pool = require('../db')
const path = require('path')
const fs = require('fs')


class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent} = req.body
            let parentFile
            if (parent) {
                const queryParentFile = await pool.query("SELECT * FROM files WHERE file_id = $1", [parent])
                parentFile = queryParentFile.rows[0]
                // console.log(parentFile)
            } else {
                const queryParentFile = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                parentFile = queryParentFile.rows[0].file_id
                console.log(parentFile);
            }
            let file
            if (!parent) {
                file = await pool.query
                ("INSERT INTO files (name, type, path, parent, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *", [name, type, name, parentFile, req.user.id])
            } else {
                file = await pool.query
                ("INSERT INTO files (name, type, path, parent, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *", [name, type, `${parentFile.path}\\${name}`, parent, req.user.id])
            }
            const fileInfo = file.rows[0] 
            // console.log(fileInfo);
            
            if(!parent) {
                fileInfo.path = name
                await fileService.createDir(fileInfo)
            } else {
                fileInfo.path = `${parentFile.path}\\${fileInfo.name}`
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
                let fileId
                fileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                console.log(fileId.rows[0].file_id);
                // files = await pool.query("SELECT FROM files WHERE file_id = (SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3)", [req.user.id.toString(), req.user.id, ''])
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [fileId.rows[0].file_id])
            } else {
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [parent])
            }
            files = files.rows
            console.log(files);
            return res.json(files) 
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Can not get files"})
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file
            // console.log(file);

            const parent = await pool.query('SELECT FROM files')
            const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.user.id])
            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({message: 'There is no space on the disk'})
            }
            
            user.usedSpace = user.usedSpace + file.size
            let filePath;
            if (parent) {
                filePath = path.join(path.resolve('files'), user.id.toString(), parent.path.toString(), file.name)
            } else {       
                filePath = path.join(path.resolve('files'), user.id.toString(), file.name)
            }

            if (fs.exystsSync(filePath)) {
                return res.status(400).json({message: 'File already exists'})
            }
            file.mv(filePath)

            const type = file.name.split('.').pop()
            const dbFile = await pool.query(
                "INSERT INTO files (name, type, size, path, parent, user_id) VALUES ($1, $2, $3, $4, $5, $6)", 
                [file.name, type, file.size, parent.path, parent.id, req.user.id])
            
            res.json(dbFile)

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }
}

module.exports = new FileController()