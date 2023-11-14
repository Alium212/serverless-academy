const { Client } = require('pg');

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const db = new Client(dbConfig);
db.connect();

const createUser = async (user) => {
    const query = {
        text: 'INSERT INTO users(id, email, password) VALUES($1, $2, $3) RETURNING *',
        values: [user.id, user.email, user.password],
    };

    const { rows } = await db.query(query);
    return rows[0];
};

const getUserByEmail = async (email) => {
    const query = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email],
    };

    const { rows } = await db.query(query);
    return rows[0];
};

module.exports = { createUser, getUserByEmail };
