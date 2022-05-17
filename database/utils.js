
import { concatVisitFrecuency } from '../helpers/concatVisitFrecuency';
import moment from 'moment';


// Me devuelve la data de clientes, ventas, stock formateada recuperada de la DB
export const getData = async (connection, nameTable, limit = 0) => {

    const sqlQuery = `select * from ${nameTable} where informado = 'N' ${(limit !== 0) ? 'limit '.concat(limit) : ''}`;
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

// me devuelve el ultimo numero de secuencia y estado (informado) del mismo
export const getInformado = async (connection) => {

    const query = "  SELECT NumSecuenciaP , Informado, FechaSecuenciaP FROM parametros ORDER BY NumSecuenciaP DESC LIMIT 1";

    const [results,] = await connection.execute(query);

    return results;
}

// informacion estadistica de las secuencias para el historial
export const getInfoSequences = async (connection) => {

    // Ver y refactorizar
    const query = 'SELECT * FROM info_secuencia LIMIT 10 ';
    const [record,] = await connection.execute(query);

    if (record.length > 0) {
        return record.map(sec => ({
            ...sec,
            informado: (sec.informado == 'N') ? 'NO' : 'SI',
            fecha: moment(sec.fecha).format("L")
        })).sort(function (a, b) {
            return b.num_secuencia - a.num_secuencia;
        });
    }

    return [];


}



