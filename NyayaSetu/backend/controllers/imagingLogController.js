const ImagingLog = require('../models/imagingLogModel');
const { logImagingEvidence } = require('../utils/blockchainLogger');

exports.logImagingAction = async (req, res) => {
  try {
    console.log("Received imaging log request:", req.body);
    const {evidenceId, fileName, sha256, action, downloaded } = req.body;
    let log = await ImagingLog.findOne({ fileName, sha256 });

    if (!log) {
      log = new ImagingLog({ evidenceId, fileName, sha256 });
    } else if (!log.evidenceId) {
      log.evidenceId = evidenceId;
    }

    if (action === "imaging_done") {
      log.imagingDone = true;
      log.imagingTimestamp = new Date();
      if (typeof downloaded === "boolean") {
        log.downloaded = downloaded;
        if (downloaded) {
          log.downloadTimestamp = new Date();
        } else {
          log.downloadTimestamp = undefined;
        }
      }
    }
    if (action === "downloaded") {
      log.downloaded = true;
      log.downloadTimestamp = new Date();
    }

    await log.save();
    console.log("Imaging log saved:", log); 

    try {
      await logImagingEvidence({
        evidenceId,
        fileName,
        sha256Hash: sha256,
        imagingDone: !!log.imagingDone,
        downloaded: !!log.downloaded
      });
      console.log("Imaging evidence logged on blockchain");
    } catch (blockchainErr) {
      console.error("Blockchain logging failed:", blockchainErr.message);
    }

    res.status(200).json({
      message: `Status: Imaging Done: ${log.imagingDone}, Downloaded: ${log.downloaded}`,
      imagingDone: log.imagingDone,
      downloaded: log.downloaded
    });
  } catch (err) {
    console.error("Error saving imaging log:", err); // Add this
    res.status(500).json({ error: "Failed to log imaging action" });
  }
};