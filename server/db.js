const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: '926633003',
    host: 'localhost',
    port: 5432,
    database: 'cloud'
})

module.exports = pool