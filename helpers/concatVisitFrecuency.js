export const concatVisitFrecuency = (clients) => {

    clients.forEach(client => {
        client.visitFrequency = client.visitFrequency1 + client.visitFrequency2 + client.visitFrequency3 + client.visitFrequency4 + client.visitFrequency5 + client.visitFrequency6 + client.visitFrequency7;

        // ver corregir desde tabla
        client.streetNumber = Number(client.streetNumber);

        delete client.visitFrequency1;
        delete client.visitFrequency2;
        delete client.visitFrequency3;
        delete client.visitFrequency4;
        delete client.visitFrequency5;
        delete client.visitFrequency6;
        delete client.visitFrequency7;

        delete client.Informado;
        delete client.Secuencia;

    })

    return clients
    

}

