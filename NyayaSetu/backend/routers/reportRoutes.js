// reportRoute.js

const express = require("express");
const router = express.Router();
const Case = require("../models/caseModel");
const Evidence = require("../models/evidenceModel");
const reportController = require("../controllers/reportController"); // <-- add this
const { authenticate } = require("../middleware/authMiddleware");

// Get Case Details
router.get('/case/:caseId', async (req, res) => {
    try {
        const caseDetails = await Case.findOne({ caseId: req.params.caseId });

        if (caseDetails) {
            res.status(200).json(caseDetails);
        } else {
            res.status(404).json({ message: 'Case not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

// Get Evidence Details
router.get('/evidences/:caseId', async (req, res) => {
    try {
        const evidences = await Evidence.find({ caseId: req.params.caseId });

        if (evidences.length > 0) {
            res.status(200).json(evidences);
        } else {
            res.status(404).json({ message: 'No evidences found for the given caseId' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
router.post('/log-summary', authenticate, reportController.logSummaryOnChain);
module.exports = router;