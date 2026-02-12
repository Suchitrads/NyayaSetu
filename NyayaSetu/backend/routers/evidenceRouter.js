const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer();

router.post('/add', authenticate, evidenceController.addEvidence);
router.get('/', authenticate, evidenceController.getAllEvidence);
router.get('/assigned', authenticate, evidenceController.getAssignedEvidences);
router.get('/transferred-to-analyst', authenticate, evidenceController.getTransferredEvidenceForAnalyst);
router.post('/transfer', authenticate, evidenceController.transferEvidence);
router.get('/logs/:evidenceId', authenticate, evidenceController.getEvidenceLogs);
router.post('/record-transfer', authenticate, evidenceController.recordTransfer);
router.put('/:evidenceId', authenticate, evidenceController.updateEvidence);
router.get('/details/:evidenceId', authenticate, evidenceController.getEvidenceFullDetails);
router.post('/transfer-to-io', authenticate, evidenceController.transferEvidenceToIO);
router.get('/assigned-to-io', authenticate, evidenceController.getTransferredEvidenceForOfficer);
router.get('/:evidenceId', authenticate, evidenceController.getEvidenceById);



module.exports = router;