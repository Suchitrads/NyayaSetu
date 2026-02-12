const express = require('express');
const router = express.Router();
const EvidenceIntegrity = require('../models/evidenceIntegrityModel');
const { checkIntegrity } = require('../controllers/integrityController');
const { authenticate } = require('../middleware/authMiddleware');

// Save integrity record
router.post('/', authenticate, async (req, res) => {
  try {
    const { evidenceId, evidenceType, hash, status } = req.body;
    const newRecord = new EvidenceIntegrity({
      evidenceId,
      evidenceType,
      hash,
      status,
      verifiedAt: new Date()
    });
    await newRecord.save();
    res.status(201).json({ message: 'Integrity record saved successfully' });
  } catch (error) {
    console.error('Error saving integrity record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Integrity verification
router.get('/checkIntegrity', authenticate, checkIntegrity);

// Fetch integrity records for an evidence
router.get('/:evidenceId', authenticate, async (req, res) => {
  try {
    const integrityLogs = await EvidenceIntegrity.find({ evidenceId: req.params.evidenceId }).lean();
    res.json(integrityLogs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;