const Log = require('../models/logModel');
const crypto = require('crypto-js');

const logAction = (action, details) => async (req, res, next) => {
    try {
        const evidenceId = req.body.evidenceId || req.params.evidenceId;
        const evidenceDetails = JSON.stringify(req.body);
        const evidenceHash = crypto.SHA256(evidenceDetails).toString();

        const log = new Log({
            action,
            details,
            role: req.user.role,
            wallet: req.user.wallet,
            evidenceId,
            evidenceHash
        });
        await log.save();
        next();
    } catch (error) {
        console.error('Error logging action:', error);
        next(error);
    }
};

module.exports = logAction;