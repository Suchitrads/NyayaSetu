const mongoose = require('mongoose');
const AnalysisResultSchema = new mongoose.Schema({
  evidenceId: String,
  fileName: String,
  analysisType: String,
  result: mongoose.Schema.Types.Mixed, // can store object or string
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AnalysisResult', AnalysisResultSchema);