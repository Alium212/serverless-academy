const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied' });
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ success: false, error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };
