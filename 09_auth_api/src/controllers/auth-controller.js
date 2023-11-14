const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('../services/user-service');
const User = require('../models/user-model');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_TTL }
    );

    const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET
    );

    return { accessToken, refreshToken };
};

const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await userService.getUserByEmail(email);

        if (existingUser) {
            return res
                .status(409)
                .json({ success: false, error: 'Email is already registered' });
        }

        const user = new User(email, password);
        const createdUser = await userService.createUser(user);

        const tokens = generateTokens(createdUser);

        res.json({ success: true, data: { id: createdUser.id, ...tokens } });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: 'User not found' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res
                .status(401)
                .json({ success: false, error: 'Invalid email or password' });
        }

        const tokens = generateTokens(user);

        res.json({ success: true, data: { id: user.id, ...tokens } });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

module.exports = { signUp, signIn };
