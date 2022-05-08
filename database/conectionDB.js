const mysql = require('mysql2/promise');
const config = require('../config');

// retorno la conexion a la base de datos
const connectionDB = async () => {

    return mysql.createConnection(config.db);

}

module.exports = connectionDB;