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

    deleteFile(file) {
        const path = this.getPath(file)
        if (file.type === 'dir') {
            fs.rmdirSync(path)
        } else {
            fs.unlinkSync(path)
        }
    }
    
    getPath(file) {
        return path.join(path.resolve('files'), file.user_id.toString(), file.path.toString())
    }
}

module.exports = new FileService()
