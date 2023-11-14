require('dotenv').config();
const express = require('express');
const authRoutes = require('./src/routes/auth-routes');
const userRoutes = require('./src/routes/user-routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRoutes);
app.use(userRoutes);

const start = async () => {
    try {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
