const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');

router.get('/keys', authenticate, (req, res) => {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

    res.json({
        pinataApiKey,
        pinataSecretApiKey
    });
});

module.exports = router;