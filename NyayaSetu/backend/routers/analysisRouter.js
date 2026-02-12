const express = require('express');
const router = express.Router();
const {authenticate} = require('../middleware/authMiddleware');
const analysisResultController = require('../controllers/analysisController');
const AnalysisResult = require('../models/analysisModel');

router.post('/result', analysisResultController.saveResult);
router.get('/:evidenceId', authenticate, async (req, res) => {
    try {
        const results = await AnalysisResult.find({ evidenceId: req.params.evidenceId }).lean();
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;