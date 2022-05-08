// resJson es la respuesta de la API

const getStatusMessage = (resJson) => {
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

    if(resJson.statusCode >= 400){
        msgType = "danger"
    }else{
        msgType = "success"
    }

    return {message, msgType}
}

module.exports = getStatusMessage;
