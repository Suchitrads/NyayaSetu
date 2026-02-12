const express = require('express');
const router = express.Router();
const imagingLogController = require('../controllers/imagingLogController');
const {authenticate} = require('../middleware/authMiddleware');
const ImagingLog = require('../models/imagingLogModel');

router.post('/', imagingLogController.logImagingAction);

router.get('/:evidenceId', authenticate, async (req, res) => {
    try {
        const logs = await ImagingLog.find({ evidenceId: req.params.evidenceId }).lean();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;