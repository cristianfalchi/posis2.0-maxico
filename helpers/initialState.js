import { getInformado } from '../database/utils';
import { connectionDB } from '../database/conectionDB';
import moment from 'moment';

export async function initialState() {
    const connection = await connectionDB()
    const parametros = await getInformado(connection);
    const query = `select num_secuencia from info_secuencia where num_secuencia = ${parametros[0]?.NumSecuenciaP}`;
    const [result,] = await connection.execute(query);

    if (result.length <= 0) {
        const queryCustomers = `SELECT COUNT(*) as cantidad FROM customer WHERE Secuencia = ${parametros[0]?.NumSecuenciaP}`;
        const querySales = `SELECT SUM(totalPacksAmount) AS monto_total FROM sales WHERE sequenceNumber = ${parametros[0]?.NumSecuenciaP}`;
        const queryPackSales = `SELECT SUM(quantityOfPacks) AS cant_paquetes FROM sales WHERE sequenceNumber = ${parametros[0]?.NumSecuenciaP}`;
        const [customers,] = await connection.execute(queryCustomers);
        const [sales,] = await connection.execute(querySales);
        const [packsSales,] = await connection.execute(queryPackSales);
        const fecha = moment(parametros[0]?.FechaSecuenciaP).format("YYYY-MM-DD");
        await connection.execute(`INSERT INTO info_secuencia (num_secuencia, fecha, cant_clientes, cant_paquetes, monto_venta, informado) VALUES (${parametros[0]?.NumSecuenciaP}, '${fecha}', ${customers[0]?.cantidad},${packsSales[0]?.cant_paquetes}, ${sales[0]?.monto_total}, '${parametros[0]?.Informado}')`);
    }
    connection.close();
}