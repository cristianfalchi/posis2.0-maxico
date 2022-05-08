const express = require('express');
const app = express();
const connectionDB = require('./database/conectionDB');
const getStatusMessage = require('./helpers/getStatusMessage')
const fetch = require('node-fetch');
const getData = require('./helpers/getData');


// Middlewares
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);


// configuramos motor de plantillas
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);

// Siempre despues de las rutas configuradas
app.listen(app.get('port'), () => {
    console.log(`Server listen port: ${app.get('port')}`);
})

// Rutas
app.get('/', async (req, res) => {

    let message = '';
    // obtengo una conexion a bd
    const connection = await connectionDB();
    // Obtengo los datos de una secuencia
    const data = await getData(connection);
    
    if(data.customer.length === 0 && data.sales.length === 0 && data.stock.length === 0){
        message =  "No hay SECUENCIA por enviar";
        return res.render('index',{data, message: message, msgType: 'info'});
    }

    message = "Existe SECUENCIA por enviar. Consulte los datos...";
    res.render('index',{data, message: message, msgType: 'info'});

});

app.get('/send', async (req, res) => {

    const connection = await connectionDB();
    const data = await getData(connection);

    try {
       
        // en caso que el usuario quiera enviar sin datos
        if(data.sales.length === 0 || data.stock.length === 0){
            return res.redirect('/');
        }
        const secuencianumber = data.sales[0].sequenceNumber;
        // realizo el request a la API method POST
        const response = await fetch(process.env.URL_API_POST, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'x-correlation-id': '39BDeF96-3309-e9a1-B9e9-B7Dc0D35768F',
                'Content-Type': 'application/json',
                'EZDCode': '0000128804',
                'branchCode': '001',
                'sequenceNumber': '10001',
                'Accept': '*/*',
                'client_id': '771f07043a684620a951d051dbf3acc3',
                'client_secret': '2B16C836D71f43138Fa4CFa30173A18E'
            },
        })
    

        const resJson = await response.json();
        // obetengo el mensaje y el tipo de mensaje de la API
        const message = getStatusMessage(resJson);

        if(message.msgType === 'success'){
            await connection.execute("update customer set informado = 'S'")
            await connection.execute(`update sales set informado = 'S' where sequenceNumber = ${secuencianumber}`)
            await connection.execute(`update stock set informado = 'S' where sequenceNumber = ${secuencianumber}`)
            const data = await getData(connection);
            
            return res.render('index', {data, ...message});
                    
        }

       res.render('index', {data, ...message});

    } catch (error) {

        res.render('index', {data, message: error.message, msgType: 'danger'});
    }
        
 })



