require('dotenv').config()

const config = {
    db: {
        host: process.env.HOST || "localhost",
        user: process.env.USER || "root",
        password: process.env.PASSWORD || "root",
        database: process.env.DATABASE || "posis",
    }
};

module.exports = config;


