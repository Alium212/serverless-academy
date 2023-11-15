require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sendResponse = (res, data, status = 200) => {
    res.status(status).json(data);
};

const storeJsonDocument = async (jsonPath, jsonDocument, res) => {
    try {
        const result = await pool.query(
            'INSERT INTO jsonbase (path, document) VALUES ($1, $2) ON CONFLICT (path) DO UPDATE SET document = EXCLUDED.document RETURNING *',
            [jsonPath, jsonDocument]
        );

        sendResponse(res, { success: true, data: result.rows[0] });
    } catch (error) {
        sendResponse(res, { success: false, error: error.message }, 500);
    }
};

const retrieveJsonDocument = async (jsonPath, res) => {
    try {
        const result = await pool.query(
            'SELECT document FROM jsonbase WHERE path = $1',
            [jsonPath]
        );

        if (result.rows.length === 0) {
            sendResponse(
                res,
                { success: false, message: 'JSON document not found' },
                404
            );
        } else {
            sendResponse(res, { success: true, data: result.rows[0].document });
        }
    } catch (error) {
        sendResponse(res, { success: false, error: error.message }, 500);
    }
};

app.use(express.json());

app.put('/:json_path', (req, res) => {
    const jsonPath = req.params.json_path;
    const jsonDocument = req.body;

    storeJsonDocument(jsonPath, jsonDocument, res);
});

app.get('/:json_path', (req, res) => {
    const jsonPath = req.params.json_path;

    retrieveJsonDocument(jsonPath, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
