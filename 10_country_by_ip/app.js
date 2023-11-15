require('dotenv').config();
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ipDatabase = [];

const readIPDatabase = () => {
    fs.createReadStream(process.env.FILE_NAME)
        .pipe(csv({
            headers: ['from', 'to', 'shortName', 'fullName']
        }))
        .on('data', (row) => {
            ipDatabase.push({
                from: row.from,
                to: row.to,
                shortName: row.shortName,
                fullName: row.fullName,
            });
        });
};

const setClientIp = (req, res, next) => {
    req.clientIp =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
    next();
};

const ipToNumber = (ip) => {
    return ip.split('.').reduce((acc, val) => acc * 256 + parseInt(val, 10), 0);
};

const binarySearch = (userIpNum) => {
    let low = 0;
    let high = ipDatabase.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const fromIp = ipToNumber(ipDatabase[mid].from);
        const toIp = ipToNumber(ipDatabase[mid].to);

        if (userIpNum >= fromIp && userIpNum <= toIp) {
            return ipDatabase[mid];
        } else if (userIpNum < fromIp) {
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }

    return null;
};

const detectLocation = (req, res) => {
    const userIp = req.clientIp.replace('::ffff:', '');
    const userIpNum = ipToNumber(userIp);

    const result = binarySearch(userIpNum);

    if (result) {
        res.json({
            ipAddress: userIp,
            country: result.fullName,
            addressRange: `${result.from} - ${result.to}`,
        });
    } else {
        res.status(404).json({ error: 'Location not found' });
    }
};

readIPDatabase();

app.use(setClientIp);

app.get('/detect-location', detectLocation);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
