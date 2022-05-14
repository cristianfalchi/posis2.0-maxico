const express = require('express');
const fetch = require('node-fetch');
const { body, validationResult } = require('express-validator');
const cors = require('cors')
import './firebase/config-firebase'
import { getStatusMessage } from './helpers/getStatusMessage'
import { getInformado, getData, getInfoSequences } from './database/utils';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { authorization } from './middleware/authorization'
import moment from 'moment';
import { initialState } from './helpers/initialState';
import { connectionDB } from './database/conectionDB';
// creamos un servidor express
const app = express();

// variables y funciones globales
let displayName = '';
let message = '';
let connection = null;
let parametros = null;

// Middlewares
app.use(cors());
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
app.listen(app.get('port'), async () => {
    console.log(`Server listen port: ${app.get('port')}`);
    await initialState();
    connection = await connectionDB();
    parametros = await getInformado(connection); // [{...}] o [] numero de secuencia, fecha, informado

})


// Rutas
app.get('/', authorization, async (req, res) => {

    (parametros.length > 0 && parametros[0].Informado === 'N')
        ? message = `La SECUENCIA N°: ${parametros[0]?.NumSecuenciaP} está pendiente de enviar.`
        : message = "No hay SECUENCIA pendiente de enviar.";

    res.render('index', { informado: parametros[0]?.Informado, message, msgType: 'info', displayName });

});

app.get('/clientes', authorization, async (req, res) => {

    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const customers = await getData(connection, 'customer');
        return res.render('customers', { customers, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('customers', { customers: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/ventas', authorization, async (req, res) => {

    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const sales = await getData(connection, 'sales');
        return res.render('sales', { sales, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('sales', { sales: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/stock', authorization, async (req, res) => {

    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const stock = await getData(connection, 'stock');
        return res.render('stock', { stock, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('stock', { stock: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/send', async (req, res) => {

    // Unknown column 'undefined' in 'where clause'
    try {

        // en caso que el usuario quiera enviar sin datos
        if (parametros[0]?.Informado === 'S') {
            return res.redirect('/');
        }

        const customer = await getData(connection, 'customer');
        // elimino el campo Secuencia de los clientes
        customer.forEach(customer => delete customer.Secuencia);
        console.log(customer);
        const sales = await getData(connection, 'sales');
        const stock = await getData(connection, 'stock');

        // especificacion de la API
        const data = { customer, sales, stock };

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
        
        // respuesta del POST
        const resJson = await response.json();

        // obetengo el mensaje y el tipo de mensaje de la API
        message = getStatusMessage(resJson);

        if (message.msgType === 'success') {
            await connection.execute(`update customer set informado = 'S' where Secuencia = ${parametros[0]?.NumSecuenciaP}`)
            await connection.execute(`update sales set informado = 'S' where sequenceNumber = ${parametros[0]?.NumSecuenciaP}`)
            await connection.execute(`update stock set informado = 'S' where sequenceNumber = ${parametros[0]?.NumSecuenciaP}`)
            await connection.execute(`update parametros set informado = 'S' where NumSecuenciaP = ${parametros[0]?.NumSecuenciaP}`)
            await connection.execute(`update info_secuencia set informado = 'S' where num_secuencia = ${parametros[0]?.NumSecuenciaP}`)

            parametros = await getInformado(connection);
            return res.render('index', { informado: parametros[0]?.Informado, ...message, displayName });
        }

        res.render('index', { informado: parametros[0]?.Informado, ...message, displayName });

    } catch (error) {
        error.message = 'Problema con la comunicación. Vuelva a intentarlo en un momento por favor!'
        res.render('index', { informado: parametros[0]?.Informado, message: error.message, msgType: 'danger', displayName });
    }

})

app.get('/historial', authorization, async (req, res) => {

    const record = await getInfoSequences(connection)
    res.render('historial', { record, informado: parametros[0]?.Informado, displayName });
})

// realiza la autenticacion del usuario
app.post(
    '/login',
    body('correo').isEmail(),
    body('contraseña').isLength({ min: 5 }),
    (req, res) => {

        const { correo, contraseña } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('login', { errors, correo, contraseña });
        } else {
            const auth = getAuth();
            signInWithEmailAndPassword(auth, correo, contraseña)
                .then(({ user }) => { // user esta dentro de userCredential
                    displayName = user.displayName;
                    res.redirect('/');
                })
                .catch((error) => {
                    message = 'El usuario o contraseña no es valido!'
                    res.render('login', { message, correo, contraseña });
                })
        }
    })

// muestra el formulario de login
app.get('/login', (req, res) => {
    // console.log(req.originalUrl);
    // compruebo que no este logueado
    res.render('login');
})

app.get('/logout', (req, res) => {

    const auth = getAuth();
    if (auth.currentUser) {
        signOut(auth)
    }
    res.redirect('login');

})


app.get('/reset', authorization, async (req, res) => {

    try {

        await connection.execute("UPDATE customer SET Informado = 'N' WHERE Secuencia = 3276");
        await connection.execute("UPDATE sales SET informado = 'N' WHERE sequenceNumber = 3276");
        await connection.execute("UPDATE stock SET informado = 'N' WHERE sequenceNumber = 3276");
        await connection.execute("UPDATE parametros SET Informado = 'N' WHERE NumSecuenciaP = 3276");
        await connection.execute("UPDATE info_secuencia SET informado = 'N' WHERE num_secuencia = 3276");

        message = getStatusMessage({ statusCode: 200 });

        parametros = await getInformado(connection);
        return res.render('index', { informado: parametros[0]?.Informado, ...message, displayName });

    } catch (error) {
        return res.render('index', { informado: parametros[0]?.Informado, message: error.message, msgType: 'danger', displayName });
    }

    // UPDATE customer SET Informado = 'N' WHERE Secuencia = 3272
    // UPDATE sales SET informado = 'N' WHERE sequenceNumber = 3272
    // UPDATE stock SET informado = 'N' WHERE sequenceNumber = 3272
    // UPDATE parametros SET Informado = 'N' WHERE NumSecuenciaP = 3272

})


// para rutas no coincidentes
app.get('*', (req, res) => {
    const auth = getAuth();
    if (auth.currentUser) {
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
})

