const getUserProfile = (req, res) => {
    const { id, email } = req.user;
    res.json({ success: true, data: { id, email } });
};

module.exports = { getUserProfile };
