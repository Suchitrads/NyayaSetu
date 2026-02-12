const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    wallet: {
        type: String,
        required: true
    },
    evidenceId: {
        type: String,
        required: true
    },
    evidenceHash: {
        type: String,
        required: true
    }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;