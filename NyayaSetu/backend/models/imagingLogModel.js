const mongoose = require('mongoose');

const ImagingLogSchema = new mongoose.Schema({
  evidenceId: String,
  fileName: String,
  sha256: String,
  imagingDone: { type: Boolean, default: false },
  imagingTimestamp: Date,
  downloaded: { type: Boolean, default: false },
  downloadTimestamp: Date
});

module.exports = mongoose.model('ImagingLog', ImagingLogSchema);