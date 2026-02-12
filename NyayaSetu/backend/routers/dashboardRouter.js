const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware'); // Import role-based middleware
const logAction = require('../middleware/logMiddleware');
const {
    getEvidenceLogs,
    transferEvidence,
    addEvidence,
    updateEvidence,
    getAllEvidence,
    getEvidenceById
} = require('../controllers/evidenceController');

const router = express.Router();

// Dashboard view: All authenticated users
router.get(
    '/dashboard',
    authenticate,
    logAction('View Dashboard', 'User viewed the dashboard'),
    (req, res) => {
        const wallet = req.user.wallet;
        res.status(200).json({ message: `Welcome ${wallet}`, user: req.user });
    }
);

// Investigation Officer: Register/Update Case (assuming these are evidence operations)
router.post(
    '/evidence',
    authenticate,
    roleMiddleware(['investigation_officer']),
    logAction('Register Case', 'Investigation Officer registered a case'),
    addEvidence
);
router.put(
    '/evidence/update/:evidenceId',
    authenticate,
    roleMiddleware(['investigation_officer']),
    logAction('Update Case', 'Investigation Officer updated a case'),
    updateEvidence
);

// Collector: Add/Update Evidence
router.post(
    '/evidence/collector',
    authenticate,
    roleMiddleware(['collector']),
    logAction('Add Evidence', 'Collector added new evidence'),
    addEvidence
);
router.put(
    '/evidence/collector/update/:evidenceId',
    authenticate,
    roleMiddleware(['collector']),
    logAction('Update Evidence', 'Collector updated evidence'),
    updateEvidence
);

// Forensic Analyst: Imaging, Analysis, Integrity (custom endpoints as needed)
router.post(
    '/evidence/forensic/imaging',
    authenticate,
    roleMiddleware(['forensic_analyst']),
    logAction('Imaging', 'Forensic Analyst performed imaging'),
    (req, res) => {
        // Imaging logic here
        res.json({ message: 'Imaging done' });
    }
);
router.post(
    '/evidence/forensic/analysis',
    authenticate,
    roleMiddleware(['forensic_analyst']),
    logAction('Analysis', 'Forensic Analyst performed analysis'),
    (req, res) => {
        // Analysis logic here
        res.json({ message: 'Analysis done' });
    }
);
router.post(
    '/evidence/forensic/integrity',
    authenticate,
    roleMiddleware(['forensic_analyst']),
    logAction('Integrity', 'Forensic Analyst checked integrity'),
    (req, res) => {
        // Integrity check logic here
        res.json({ message: 'Integrity check done' });
    }
);

// Admin: All other routes (including transfer, logs, get all/by id)
router.get(
    '/evidence/logs/:evidenceId',
    authenticate,
    roleMiddleware(['admin']),
    getEvidenceLogs
);
router.post(
    '/evidence/transfer',
    authenticate,
    roleMiddleware(['admin']),
    logAction('Transfer Evidence', 'Admin transferred evidence'),
    transferEvidence
);
router.get(
    '/evidence',
    authenticate,
    roleMiddleware(['admin']),
    getAllEvidence
);
router.get(
    '/evidence/:evidenceId',
    authenticate,
    roleMiddleware(['admin']),
    getEvidenceById
);

module.exports = router;