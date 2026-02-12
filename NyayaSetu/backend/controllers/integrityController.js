const Evidence = require('../models/evidenceModel');
const { logIntegrityRecord } = require('../utils/blockchainLogger'); 

exports.checkIntegrity = async (req, res) => {
    try {
        const { evidenceId, fileHash } = req.query;

        if (!evidenceId || !fileHash) {
            return res.status(400).json({ status: "error", message: "Missing evidenceId or fileHash" });
        }

        console.log("========== INTEGRITY CHECK ==========");
        console.log("EvidenceId from query:", `"${evidenceId}"`, "| length:", evidenceId.length);
        console.log("fileHash from query:", `"${fileHash}"`, "| length:", fileHash.length);

        // Use case-insensitive and trimmed search for evidenceId
        const evidence = await Evidence.findOne({
            evidenceId: { $regex: `^${evidenceId.trim()}$`, $options: 'i' }
        });
        console.log("Evidence found:", !!evidence);

        if (!evidence) {
            console.log("ERROR: Evidence not found for ID:", evidenceId);
            return res.status(404).json({ status: "failed", message: "Evidence not found" });
        }

        // Print all file hashes for this evidence
        evidence.files.forEach((f, idx) => {
            console.log(`File[${idx}] fileHash: "${f.fileHash}" | length: ${f.fileHash.length}`);
        });

        // Compare hashes (trim and lowercase for robustness)
        const match = evidence.files.find(
            f => f.fileHash.trim().toLowerCase() === fileHash.trim().toLowerCase()
        );

        // Prepare status for blockchain
        const status = match ? "verified" : "failed";

        // Log to blockchain
        try {
            await logIntegrityRecord({
                evidenceId,
                sha256Hash: fileHash,
                status
            });
            console.log("Integrity record logged on blockchain");
        } catch (blockchainErr) {
            console.error("Blockchain logging failed:", blockchainErr.message);
        }

        if (match) {
            console.log("MATCH FOUND: Integrity Verified");
            return res.status(200).json({ status: "verified", message: "Integrity Verified" });
        } else {
            console.log("NO MATCH: Integrity Failed");
            return res.status(200).json({ status: "failed", message: "Integrity Failed" });
        }
    } catch (error) {
        console.error('Error checking integrity:', error);
        res.status(500).json({ status: "error", message: "Server error", error });
    }
};

