const mongoose = require("mongoose");
const evidenceIntegrityModel = require('../models/evidenceIntegrityModel');


const evidenceIntegritySchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    required: true,
    ref: "Case", // assuming 'Case' is your main case collection
  },
  evidenceType: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  status: {
  type: String,
  enum: ['Verified', 'Tampered', 'Pending'], 
  default: 'Pending'
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('evidenceIntegrity', evidenceIntegritySchema, 'evidenceintegrities');
