const fileService = require('../services/fileService')
const pool = require('../db')
const path = require('path')
const fs = require('fs')
const uuid = require('uuid')


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
            const {sort, parent} = req.query

            let files 
            switch (sort) {
                case 'name':
                    if (!parent) {
                        let fileId
                        fileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                        // console.log('если нет parent, fileId = ', fileId.rows[0].file_id);
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY name", [fileId.rows[0].file_id])
                    } else {
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY name", [parent])
                    }
                    break
                case 'type':
                    if (!parent) {
                        let fileId
                        fileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                        // console.log('если нет parent, fileId = ', fileId.rows[0].file_id);
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY type", [fileId.rows[0].file_id])
                    } else {
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY type", [parent])
                    }
                    break
                case 'date':
                    if (!parent) {
                        let fileId
                        fileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                        // console.log('если нет parent, fileId = ', fileId.rows[0].file_id);
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY date", [fileId.rows[0].file_id])
                    } else {
                        files = await pool.query("SELECT * FROM files WHERE parent = $1 ORDER BY date", [parent])
                    }
                    break
                default:
                    if (!parent) {
                        let fileId
                        fileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                        // console.log('если нет parent, fileId = ', fileId.rows[0].file_id);
                        files = await pool.query("SELECT * FROM files WHERE parent = $1", [fileId.rows[0].file_id])
                    } else {
                        files = await pool.query("SELECT * FROM files WHERE parent = $1", [parent])
                    }
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
                console.log('Есть родитель, он такой: ', parentFile)
            } else {
                const queryParentFileId = await pool.query("SELECT file_id FROM files WHERE name = $1 AND user_id = $2 AND path = $3", [req.user.id, req.user.id, ''])
                // console.log('найденный file_id: ', queryParentFileId);
                const queryParentFile = await pool.query("SELECT * FROM files WHERE file_id = $1", [queryParentFileId.rows[0].file_id])
                parentFile = queryParentFile.rows[0]

                console.log('Родителя нет, присваивается это: ', parentFile);
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
                [file.name, type, file.size, `${parentFile.path}/${file.name}`, parentFile.file_id, req.user.id])
            
            res.json(dbFile.rows[0])
            console.log('После загрузки файла и добавления в БД присылает это', dbFile.rows[0]);

        } catch (e) {
            console.log(e)
            return res.status(500).json({message: "Upload error"})
        }
    }

    async downloadFile(req, res) {
        try {
            const {id} = req.query
            const fileQuery = await pool.query("SELECT * FROM files WHERE file_id = $1", [id])
            const file = fileQuery.rows[0]
            // console.log('Файл из БД:', file);
            // const filePath = path.join(path.resolve('files'), req.user.id.toString(), file.path)
            const filePath = fileService.getPath(file)
            console.log('Найденный путь к файлу: ', filePath);
            if (fs.existsSync(filePath)) {
                return res.download(filePath, file.name)
            }
            return res.status(400).json({message: "download error"})
        } catch (e) {
            console.log(e)
            res.status(500),json({message: "Download error"})
        }
    }

    async deleteFile(req, res) {
        try {
            const fileQuery = await pool.query("SELECT * FROM files WHERE file_id = $1", [req.query.id])
            const file = fileQuery.rows[0]
            // console.log('После запроса на удаление БД присылает это: ', file);
            if (!file) {
                return res.status(400).json({message: 'File not found'})
            }
            fileService.deleteFile(file)
            await pool.query("DELETE FROM files WHERE file_id = $1", [req.query.id])
            return res.json({message: 'File was delete'})
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Dir is not empty'})
        }
    }

    async searchFile(req, res) {
        try {
            const searchName = req.query.search
            let files =  await pool.query("SELECT * FROM files WHERE user_id = $1", [req.user.id])
            files = files.rows.filter(file => file.name.includes(searchName))
            return res.json(files)
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Search error'})
        }
    }

    async uploadAvatar(req, res) {
        try {
            const file = req.files.file
            const avatarName = uuid.v4() + '.jpg'
            file.mv(path.join(path.resolve('static'), avatarName))
            const newSer = await pool.query("UPDATE users SET avatar = $1 WHERE user_id = $2 RETURNING *", [avatarName, req.user.id])
            return res.json(newSer.rows[0])
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Upload avatar error'})
        }
    }

    async deleteAvatar(req, res) {
        try {
            const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [req.user.id])
            fs.unlinkSync(path.join(path.resolve('static'), user.rows[0].avatar))
            console.log(user.rows[0].avatar);
            const newSer = await pool.query("UPDATE users SET avatar = $1 WHERE user_id = $2 RETURNING *", [null, req.user.id])
            return res.json(newSer.rows[0])
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'Delete avatar error'})
        }
    }
}

module.exports = new FileController()