const mysql = require('mysql2/promise');
import {config}  from '../config'


// retorno la conexion a la base de datos
export const connectionDB = async () => {

    return mysql.createConnection(config.db);

}
