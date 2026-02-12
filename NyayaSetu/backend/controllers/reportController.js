const Case = require("../models/caseModel"); // adjust to your model names
const Evidence = require("../models/evidenceModel");
const Forensic = require("../models/analysisModel");
// const ImagingLog = require("../models/imagingLogModel");
// ...import other models as needed
const { logSummaryRecord } = require('../utils/blockchainLogger');



exports.getReportByCaseId = async (req, res) => {
    try {
        const { caseId } = req.params;

        // Fetch case details
        const caseData = await Case.findOne({ caseId });
        if (!caseData) return res.status(404).json({ error: "Case not found" });

        // Fetch related data (adjust queries as per your schema)
        const evidence = await Evidence.find({ caseId });
        const forensic = await Forensic.find({ caseId });
        // ...fetch other related data

        // Build the report object (structure as needed by frontend)
        const report = {
            caseId: caseData.caseId,
            caseName: caseData.caseName,
            investigatorName: caseData.investigatorName,
            walletAddress: caseData.walletAddress,
            dateTime: caseData.dateTime,
            location: caseData.location,
            description: caseData.description,
            suspects: caseData.suspects,
            witnesses: caseData.witnesses,
            victims: caseData.victims,
            collectors: evidence.map(e => ({
                evidenceId: e.evidenceId,
                collectorName: e.collectorName,
                walletAddress: e.collectorWallet,
                dateTime: e.collectedAt,
                numberOfCases: e.numberOfCases,
                pendingCases: e.pendingCases,
                sha256: e.sha256,
            })),
            evidenceDetails: evidence.map(e => ({
                evidenceId: e.evidenceId,
                name: e.evidenceName,
                type: e.evidenceType,
                location: e.seizedLocation,
            })),
            chainOfCustody: evidence.flatMap(e => e.chainOfCustody || []),
            collectorDescription: caseData.collectorDescription,
            forensicDetails: forensic,
            forensicDescription: caseData.forensicDescription,
            files: evidence.flatMap(e => e.files || []),
            hashVerification: evidence.flatMap(e => e.hashVerification || []),
            summary: caseData.summary,
            finalHash: caseData.finalHash,
            reportDate: caseData.reportDate,
        };
        try {
            await logSummaryRecord(report.caseId, report.summary);
                console.log("Summary stored on blockchain");
        } catch (err) {
                console.error("Blockchain log failed (summaryRecord):", err.message);
        }
        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.logSummaryOnChain = async (req, res) => {
    const { caseId, summary } = req.body;
    if (!caseId || !summary) {
        return res.status(400).json({ error: "caseId and summary are required" });
    }
    try {
        await logSummaryRecord(caseId, summary);
        console.log("Summary stored on blockchain");
        res.json({ message: "Summary logged on blockchain" });
    } catch (err) {
        console.error("Blockchain log failed (summaryRecord):", err.message);
        res.status(500).json({ error: "Blockchain log failed" });
    }
};