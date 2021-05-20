const fs = require('fs')
const config = require('config')
const path = require('path')


class FileService {
 
    createDir(file) {
        const filePath = path.join(path.resolve('files'), file.user_id.toString(), file.path.toString())
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath) 
                    return resolve({message: 'Файл создан'})
                } else {
                    return reject({message: 'Файл уже существует'})
                }
            } catch (e) {
                // return reject({message: 'File error'})
                return reject(e.message)
            }
        }))
    }
}

module.exports = new FileService()
