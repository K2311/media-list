const mysql = require("mysql2");
require("dotenv").config();

// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'testDatabase',
// });
let pool;
try {

    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    });
    console.log("Database pool created successfully");
    
} catch (error) {
    console.error("Error creating database connection pool:", error.message);
    process.exit(1);
}


pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error("Database connection was refused.");
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("Access denied. Check your credentials.");
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error("Database not found. Verify the database name.");
        } else {
            console.error("Database connection error:", err.message);
        }
        process.exit(1); 
    } else {
        console.log("Database connection successful");
        connection.release(); 
    }
});


module.exports = pool.promise();