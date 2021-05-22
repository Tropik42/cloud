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
            // console.log('file = ', file);
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
                console.log('если нет parent, fileId = ', fileId.rows[0].file_id);
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [fileId.rows[0].file_id])
            } else {
                files = await pool.query("SELECT * FROM files WHERE parent = $1", [parent])
            }
            files = files.rows
            // console.log('fetchFiles возвращает', files);
            return res.json(files) 
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Can not get files"})
        }
    }

    async uploadFile(req, res) {
        try {
            const {parent} = req.body
            console.log();
            const file = req.files.file
            console.log('Файл прислан такой: ', file);
            let parentFile
            if (parent) {
                const queryParentFile = await pool.query("SELECT * FROM files WHERE file_id = $1", [parent])
                parentFile = queryParentFile.rows[0]
                console.log('Если есть родитель, он такой: ', parentFile)
            } else {
                const queryParentFileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                // console.log('найденный file_id: ', queryParentFileId);
                const queryParentFile = await pool.query("SELECT * FROM files WHERE file_id = $1", [queryParentFileId.rows[0].file_id])
                parentFile = queryParentFile.rows[0]

                console.log('Если родителя нет, присваивается это: ', parentFile);
            }
            const queryUser = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.user.id])
            const user = queryUser.rows[0]
            console.log('Юзера БД прислала такого: ', user);
            if (user.usedspace + file.size > user.diskspace) {
                return res.status(400).json({message: 'There is no space on the disk'})
            }
            
            // user.usedSpace = user.usedspace + file.size
            let filePath;
            if (parent) {
                filePath = path.join(path.resolve('files'), user.user_id.toString(), parentFile.path.toString(), file.name)
            } else {       
                filePath = path.join(path.resolve('files'), user.user_id.toString(), file.name)
            }

            if (fs.existsSync(filePath)) {
                return res.status(400).json({message: 'File already exists'})
            }
            file.mv(filePath)

            const type = file.name.split('.').pop()
            const dbFile = await pool.query(
                "INSERT INTO files (name, type, size, path, parent, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", 
                [file.name, type, file.size, parentFile.path, parentFile.file_id, req.user.id])
            
            res.json(dbFile)

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }
}

module.exports = new FileController()