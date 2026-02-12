const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    evidenceId: String,
    caseId: String,
    evidenceName: String,
    transferredToAadhaar: String,
    transferredByAadhaar: String,
    transferredAt: Date,
    receivedAt: Date,
    status: String
});

module.exports = mongoose.model('Transfer', transferSchema);
