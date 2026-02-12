const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const transferController = require('../controllers/transferController');

const router = express.Router();

router.get(
  '/collector-to-analyst/:caseId',
  authenticate,
  transferController.getCollectorToAnalystTransfersByCaseId
);
router.get(
  '/analyst-to-io/:caseId',
  authenticate,
  transferController.getAnalystToIOTransfersByCaseId
);


module.exports = router;