import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import validUrl from 'valid-url';
import { customAlphabet } from 'nanoid';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const generateShortId = () => {
    const shortId = customAlphabet(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        6
    )();
    return shortId;
};

const handleDatabaseError = (error, res) => {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Error with the database' });
};

const saveUrlToDatabase = async (shortId, url, res) => {
    try {
        await pool.query(
            'INSERT INTO shortlinker (shortId, url) VALUES ($1, $2) ON CONFLICT (shortId) DO UPDATE SET url = $2',
            [shortId, url]
        );
    } catch (error) {
        handleDatabaseError(error, res);
    }
};

const retrieveUrlFromDatabase = async (shortId, res) => {
    try {
        const result = await pool.query(
            'SELECT url FROM shortlinker WHERE shortId = $1',
            [shortId]
        );

        if (result.rows.length > 0) {
            return result.rows[0].url;
        } else {
            throw new Error('Short URL not found');
        }
    } catch (error) {
        handleDatabaseError(error, res);
    }
};

const shortenUrl = async (url, res) => {
    if (typeof url !== 'string' || !validUrl.isUri(url)) {
        res.status(400).json({ error: 'Invalid URL' });
        return;
    }

    const shortId = generateShortId();
    await saveUrlToDatabase(shortId, url, res);

    const shortUrl = `http://localhost:${port}/${shortId}`;
    res.json({ shortUrl });
};

const redirectToOriginalUrl = async (shortId, res) => {
    try {
        const url = await retrieveUrlFromDatabase(shortId, res);
        res.redirect(url);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

app.use(bodyParser.json());

app.post('/shorten', async (req, res) => {
    await shortenUrl(req.body.url, res);
});

app.get('/:shortId', async (req, res) => {
    await redirectToOriginalUrl(req.params.shortId, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
