require('dotenv').config()

const config = {
    db: {
        host: process.env.HOST_NAME || "localhost",
        user: process.env.USER_NAME || "root",
        password: process.env.PASSWORD || "root",
        database: process.env.DATABASE || "posis",
    }
};

module.exports = config;


