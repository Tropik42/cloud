const fs = require('fs')
const config = require('config')

class FileService {

    createDir(file) {
        // const filePath = `${config.get('filePath')}\\${file.user_id}\\${file.path}`
        const filePath = `${config.get('filePath')}/${file.user_id}/${file.path}`
        console.log(filePath, typeof(filePath));
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    console.log('Попал сюда');
                    fs.mkdirSync(filePath)
                    return resolve({message: 'Файл создан'})
                } else {
                    return reject({message: 'Файл уже существует'})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }
}

module.exports = new FileService()
