const AnalysisResult = require('../models/analysisModel');
const { logAnalysisRecord } = require('../utils/blockchainLogger');

exports.saveResult = async (req, res) => {
  try {
    const {evidenceId, fileName, analysisType, result, analystWallet } = req.body;
    const saved = await AnalysisResult.create({evidenceId, fileName, analysisType, result, analystWallet });

       try {
      await logAnalysisRecord({
        evidenceId,
        fileName,
        analysisType
      });
      console.log("Analysis record logged on blockchain");
    } catch (blockchainErr) {
      console.error("Blockchain logging failed:", blockchainErr.message);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};