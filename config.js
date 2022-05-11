import 'dotenv/config'

export const config = {
    db: {
      host: process.env.HOST_NAME || "localhost",
    user: process.env.USER_NAME || "root",
    password: process.env.PASSWORD || "root",
    database: process.env.DATABASE || "posis",
    }
};

// db: {
//     host: process.env.HOST_NAME || "localhost",
//     user: process.env.USER_NAME || "root",
//     password: process.env.PASSWORD || "root",
//     database: process.env.DATABASE || "posis",
// }


// host: "localhost",
// user:  "root",
// password: "root",
// database: "posis",