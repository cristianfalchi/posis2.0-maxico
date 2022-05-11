const express = require('express');
const fetch = require('node-fetch');
const { body, validationResult } = require('express-validator');
const cors = require('cors')
import './firebase/config-firebase'
import { connectionDB } from './database/conectionDB';
import { getStatusMessage, getInformado, getData, getRecordData } from './database/utils';
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { authorization } from './middleware/authorization'

// creamos un servidor express
const app = express();

// variables globales
let displayName = '';
let message = '';
let connection = null;
let parametros = null;
async function initialConnection() {
    connection = await connectionDB();
    parametros = await getInformado(connection); // [{...}] o []
}


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
app.listen(app.get('port'), () => {
    console.log(`Server listen port: ${app.get('port')}`);
})


// Rutas
app.get('/', authorization, async (req, res) => {

    await initialConnection();
    (parametros.length > 0 && parametros[0].Informado === 'N')
        ? message = `La SECUENCIA N°: ${parametros[0]?.NumSecuenciaP} está pendiente de enviar.`
        : message = "No hay SECUENCIA pendiente de enviar.";

    res.render('index', { informado: parametros[0]?.Informado, message, msgType: 'info', displayName });

});

app.get('/clientes', authorization, async (req, res) => {

    await initialConnection();
    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const customers = await getData(connection, 'customer');
        return res.render('customers', { customers, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('customers', { customers: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/ventas', authorization, async (req, res) => {

    await initialConnection();
    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const sales = await getData(connection, 'sales');
        return res.render('sales', { sales, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('sales', { sales: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/stock', authorization, async (req, res) => {
    await initialConnection();
    if (parametros.length > 0 && parametros[0].Informado === 'N') {
        const stock = await getData(connection, 'stock');
        return res.render('stock', { stock, informado: parametros[0]?.Informado, displayName });
    }

    return res.render('stock', { stock: [], informado: parametros[0]?.Informado, displayName });

});

app.get('/send', async (req, res) => {
    await initialConnection();
    // Unknown column 'undefined' in 'where clause'
    try {

        if (parametros.length <= 0) {
            return res.redirect('/');
        }

        const customer = await getData(connection, 'customer');
        const sales = await getData(connection, 'sales');
        const stock = await getData(connection, 'stock');

        // en caso que el usuario quiera enviar sin datos

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

            const parametros2 = await getInformado(connection);
            return res.render('index', { informado: parametros2[0]?.Informado, ...message, displayName });
        }

        res.render('index', { informado: parametros[0]?.Informado, ...message, displayName });

    } catch (error) {

        res.render('index', { informado: parametros[0]?.Informado, message: error.message, msgType: 'danger', displayName });
    }

})

app.get('/historial', authorization, async (req, res) => {
    await initialConnection();
    const record = await getRecordData(connection)
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

// para rutas no coincidentes
app.get('*', (req, res) => {
    const auth = getAuth();
    if (auth.currentUser) {
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
})

