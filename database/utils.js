
import { concatVisitFrecuency } from '../helpers/concatVisitFrecuency';
import moment from 'moment';


// Me devuelve la data de clientes, ventas, stock formateada recuperada de la DB
export const getData = async (connection, nameTable, numSec) => {

    const sqlQuery = `select * from ${nameTable} where informado = 'N' limit 20 `;
    const [resData,] = await connection.execute(sqlQuery);

    switch (nameTable) {
        case 'customer':
            return (resData.length > 0) ? concatVisitFrecuency(resData) : resData;
        case 'sales':
            return resData.filter(sale => {
                delete sale.Informado
                return sale
            }).map(sale => (
                {
                    ...sale,
                    totalPacksAmount: Number(sale.totalPacksAmount),
                    documentNumber: Number(sale.documentNumber)
                }))

        case 'stock':
            return resData.filter(stk => {
                delete stk.Informado
                return stk
            })

        default:
            break;
    }

}

// me devuelve el numSec y el estado (informado) de la db
export const getInformado = async (connection) => {

    const query = "select NumSecuenciaP, Informado from parametros where Informado = 'N' ";

    const [results,] = await connection.execute(query);

    if (results.length > 0) {

        const {NumSecuenciaP, Informado} = results[0];
        return {
            numSecuencia: NumSecuenciaP,
            informado: Informado
        }
    }
    return []
}

// me devuelve un mensaje de acuerdo a lo que se recibio desde la base de datos
export const getStatusMessage = (resJson) => {
    let message = '';
    let msgType = '';

    switch (resJson.statusCode) {
        case 200:
            message = "Respond with API status object. OK."
            break;
        case 201:
            message = "Los datos se enviaron correctamente."
            break;
        case 400:
            message = "Response code 400 mapped as Bad Request."
            break;
        case 401:
            message = "Response code 401 mapped as Unauthorized."
            break;
        case 403:
            message = "Response code 403 mapped as Forbidden."
            break;
        case 404:
            message = "Response code 404 mapped as Not Found."
            break;
        case 405:
            message = "Response code 405 mapped as Method Not Allowed."
            break;
        case 406:
            message = "Response code 406 mapped as Not Acceptable."
            break;
        case 408:
            message = "Response code 408 mapped as Request Timeout."
            break;
        case 415:
            message = "Response code 415 mapped as Unsupported Media Type."
            break;
        case 500:
            message = "Response code 500 mapped as Internal Server Error."
            break;
        case 503:
            message = "Response code 503 mapped as Service Unavailable."
            break;
        case 504:
            message = "Response code 504 mapped as Gateway Timeout."
            break;
        default:
            message = "";
            msgType = ""
            break;
    }

    if (resJson.statusCode >= 400) {
        msgType = "danger"
    } else {
        msgType = "success"
    }

    return { message, msgType }
}

// retorna un arreglo con los objetos que encuentra en la db
export const getRecordData = async (connection) => {

    const query = 'select NumSecuenciaP, FechaSecuenciaP, Informado from parametros group by NumSecuenciaP';
    const [record,] = await connection.execute(query);
    
    return record.map(sec => ({
        ...sec,
        Informado: (sec.Informado == 'N') ? 'NO' : 'SI',
        FechaSecuenciaP: moment(sec.FechaSecuenciaP).format("L")
    })).sort(function(a, b) {
        return b.NumSecuenciaP - a.NumSecuenciaP ;
      });

    
    
}



