const mongoose = require('mongoose');

const AnalystTransferSchema = new mongoose.Schema({
    evidenceId: { type: String, required: true },
    caseId: { type: String, required: true },
    transferredToAadhaar: { type: String, required: true },
    transferredByAadhaar: { type: String, required: true },
    evidenceDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'Evidence', required: true },
    imagingLogs: [{ type: mongoose.Schema.Types.Mixed }],
    integrityLogs: [{ type: mongoose.Schema.Types.Mixed }],
    analysisResults: [{ type: mongoose.Schema.Types.Mixed }],
    transferredAt: { type: Date, default: Date.now },
    receivedAt: { type: Date,default: Date.now },
    status: { type: String, default: "Transferred" },
});

module.exports = mongoose.model('AnalystTransfer', AnalystTransferSchema);
