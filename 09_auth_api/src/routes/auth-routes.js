const express = require('express');
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.get('/me', authMiddleware.authenticateToken, (req, res) => {
    const { id, email } = req.user;
    res.json({ success: true, data: { id, email } });
});

module.exports = router;
