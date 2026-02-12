const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    evidenceId: { type: String, required: true },
    caseId: { type: String, required: true },
    evidenceName: { type: String, required: true },
    location: { type: String, required: true },
    collectorName: { type: String, required: true },
    collectorWallet: { type: String, required: true },
    officerName: { type: String, required: true },
    officerWallet: { type: String, required: true },
    evidenceDescription: { type: String, required: true },
    evidenceType: { type: String, required: true },
    evidenceCondition: { type: String, required: true },
    evidenceFields: { type: Map, of: String },
    files: [{
        fileName: { type: String, required: true },
        fileSize: { type: Number, required: true },
        fileType: { type: String, required: true },
        fileHash: { type: String, required: true },
        ipfsHash: { type: String, required: false }
    }],
    forensicsAnalystName: { type: String, required: false },
    forensicsAnalystWallet: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Evidence', evidenceSchema);