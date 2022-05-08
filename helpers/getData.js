const concatVisitFrecuency = require('./concatVisitFrecuency');

const getData = async (connection) => {

    const sqlClients = "select * from customer where informado = 'N' limit 20 ";
    const sqlSales = "select * from sales where informado = 'N' limit 20";
    const sqlStock = "select * from stock where informado = 'N' limit 20";

    const [resClients,] = await connection.execute(sqlClients);
    const [sales,] = await connection.execute(sqlSales);
    const [stock,] = await connection.execute(sqlStock);

    return {
        customer: (resClients.length > 0) ? concatVisitFrecuency(resClients) : resClients,
        sales: sales.filter(sale => {
            delete sale.informado
            return sale
        }).map(sale => (
            {
                ...sale,
                totalPacksAmount: Number(sale.totalPacksAmount),
                documentNumber: Number(sale.documentNumber)
            })),
       
        stock: stock.filter(stk => {
            delete stk.informado
            return stk
        })
    }
}

module.exports = getData;