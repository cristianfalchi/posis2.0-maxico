export const concatVisitFrecuency = (clients) => {

    return clients.map(client => {

        const {
            Informado,
            visitFrequency1,
            visitFrequency2,
            visitFrequency3,
            visitFrequency4,
            visitFrequency5,
            visitFrequency6,
            visitFrequency7,
            ...resto

        } = client;
               
        const visitas = visitFrequency1 + visitFrequency2 + visitFrequency3 + visitFrequency4 + visitFrequency5 + visitFrequency6 + visitFrequency7;
        const reg1 = /1/g;
        const reg2 = /0/g;
        resto.visitFrequency = visitas.replace(reg1, 'X').replace(reg2, ' ');
        
        // ver corregir desde tabla
        resto.streetNumber = Number(resto.streetNumber);
        
        return resto;

    })

}

