const Evidence = require('../models/evidenceModel');
const User = require('../models/userModel');
const Log = require('../models/logModel');
const crypto = require('crypto-js');
const { logAddEvidence, logUpdateEvidence, logTransferRecord } = require('../utils/blockchainLogger');
const EvidenceTransfer = require('../models/transferModel');
const Transfer = require('../models/transferModel');
const ImagingLog = require('../models/imagingLogModel');
const IntegrityLog = require('../models/evidenceIntegrityModel');
const AnalysisResult = require('../models/analysisModel');
const AnalystTransfer = require('../models/analysttransferModel');

exports.getAllEvidence = async (req, res) => {
    try {
        const evidence = await Evidence.find(); // fetches all evidence documents
        res.status(200).json(evidence);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching evidence', error });
    }
};


exports.addEvidence = async (req, res) => {
    try {
        const evidenceData = req.body;

        // Encrypt IPFS hashes (CIDs)
        evidenceData.files = evidenceData.files.map(file => ({
            ...file,
            ipfsHash: crypto.AES.encrypt(file.ipfsHash, 'your-secret-key').toString()
        }));

        const evidence = new Evidence(evidenceData);
        await evidence.save();

        const log = new Log({
            action: 'Added',
            details: 'Evidence added to the system',
            role: req.user.role,
            wallet: req.user.wallet,
            evidenceId: evidence.evidenceId,
            evidenceHash: crypto.SHA256(JSON.stringify(evidenceData)).toString()
        });
        await log.save();

        // ✅ Blockchain log
        try {
            await logAddEvidence({
                evidenceId: evidenceData.evidenceId,
                caseId: evidenceData.caseId,
                evidenceName: evidenceData.evidenceName,
                seizureLocation: evidenceData.seizureLocation || "",
                collectorName: evidenceData.collectorName || "",
                collectorWallet: evidenceData.collectorWallet || "",
                investigatingOfficerName: evidenceData.investigatingOfficerName || "",
                investigatingOfficerWallet: evidenceData.investigatingOfficerWallet || "",
                description: evidenceData.description || "",
                type: evidenceData.type || "",
                condition: evidenceData.condition || ""
            });
        } catch (err) {
            console.error('Blockchain log failed (addEvidence):', err.message);
        }

        res.status(201).json({ message: 'Evidence added successfully', evidence });
    } catch (error) {
        res.status(400).json({ message: 'Error adding evidence', error });
    }
};


exports.getEvidenceById = async (req, res) => {
    try {
        const evidence = await Evidence.findOne({ evidenceId: req.params.evidenceId });
        if (!evidence) {
            return res.status(404).json({ message: 'Evidence not found' });
        }

        const decryptedFiles = evidence.files.map(file => {
            const decryptedIpfsHash = crypto.AES.decrypt(file.ipfsHash, 'your-secret-key').toString(crypto.enc.Utf8);
            return {
                ...file,
                ipfsHash: decryptedIpfsHash,
                fileSize: file.fileSize,
                fileType: file.fileType
            };
        });
        evidence.files = decryptedFiles;
        res.status(200).json(evidence);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching evidence', error });
    }
};

exports.updateEvidence = async (req, res) => {
    try {
        const { evidenceId } = req.params;
        const updatedData = req.body;

        // Encrypt IPFS hashes (CIDs)
        updatedData.files = updatedData.files.map(file => ({
            ...file,
            ipfsHash: crypto.AES.encrypt(file.ipfsHash, 'your-secret-key').toString()
        }));

        const evidence = await Evidence.findOneAndUpdate({ evidenceId }, updatedData, { new: true });

        if (!evidence) {
            return res.status(404).json({ message: 'Evidence not found' });
        }

        const log = new Log({
            action: 'Updated',
            details: 'Evidence updated in the system',
            role: req.user.role,
            wallet: req.user.wallet,
            evidenceId: evidence.evidenceId,
            evidenceHash: crypto.SHA256(JSON.stringify(updatedData)).toString()
        });
        await log.save();

        // ✅ Blockchain log
        try {
            await logUpdateEvidence({
                evidenceId,
                condition: updatedData.condition || ""
            });
        } catch (err) {
            console.error('Blockchain log failed (updateEvidence):', err.message);
        }

        res.status(200).json({ message: 'Evidence updated successfully', evidence });
    } catch (error) {
        console.error('Error updating evidence:', error);
        res.status(500).json({ message: 'Error updating evidence', error });
    }
};


exports.getEvidenceLogs = async (req, res) => {
    try {
        const evidenceId = req.params.evidenceId;
        const logs = await Log.find({ evidenceId });

        if (!logs) {
            return res.status(404).json({ message: 'Logs not found' });
        }

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching logs', error });
    }
};

exports.transferEvidence = async (req, res) => {
    try {
        const { evidenceId, aadhaar } = req.body;
        console.log('📥 Transfer request received:', { evidenceId, aadhaar });

        if (!evidenceId || !aadhaar) {
            console.log('❌ Missing evidenceId or aadhaar in request.');
            return res.status(400).json({ message: 'Evidence ID and Aadhaar address are required.' });
        }

        const evidence = await Evidence.findOne({ evidenceId });
        if (!evidence) {
            console.log('❌ Evidence not found for evidenceId:', evidenceId);
            return res.status(404).json({ message: 'Evidence not found. Please check the Evidence ID.' });
        }

        const cleanedAadhaar = aadhaar.trim();
        const forensicsAnalyst = await User.findOne({
            aadhaar: cleanedAadhaar,
            role: { $regex: /^forensic analyst$/i } // exact role match, case-insensitive
        });

        if (!forensicsAnalyst) {
            console.log('❌ Forensics analyst not found for Aadhaar:', cleanedAadhaar);
            return res.status(404).json({
                message: 'Aadhaar address not found or user is not a Forensic Analyst. Please check the Aadhaar address and role.'
            });
        }

        await Evidence.updateOne(
        { evidenceId },
        {
            $set: {
                forensicsAnalystName: forensicsAnalyst.fullName,
                forensicsAnalystWallet: forensicsAnalyst.walletAddress,
                forensicsAnalystAadhaar: forensicsAnalyst.aadhaar  // ADD THIS LINE
            }
        }
    );// ✅ Blockchain log for transfer
        try {
            const transferData = {
                evidenceId: evidence.evidenceId,
                caseId: evidence.caseId,
                transferredTo: `(${forensicsAnalyst.aadhaar})`,
                status: "Transferred",
                remarks: `Transferred to ${forensicsAnalyst.fullName} (${forensicsAnalyst.aadhaar})`
            };
            console.log("About to call logTransferRecord with:", transferData);
            await logTransferRecord(transferData);
            console.log("recordTransfer successful");
        } catch (err) {
            console.error('Blockchain log failed (transferRecord):', err.message);
        }

        console.log(`✅ Evidence ${evidenceId} transferred to ${forensicsAnalyst.fullName} successfully.`);
        return res.status(200).json({
            message: `Evidence transferred successfully to ${forensicsAnalyst.fullName}.`
        });

    } catch (error) {
        console.error('🔥 Error transferring evidence:', error);
        return res.status(500).json({
            message: 'An internal server error occurred while transferring evidence. Please try again later.'
        });
    }
};

exports.getAssignedEvidences = async (req, res) => {
    try {
        console.log("Req.user in getAssignedEvidences:", req.user); // ✅ LOG HERE

        const aadhaar = req.user?.aadhaar;
        if (!aadhaar) {
            console.error("Aadhaar missing in token payload.");
            return res.status(401).json({ message: "Aadhaar address missing. Please re-login." });
        }

        const assignedEvidences = await Evidence.find({
            forensicsAnalystAadhaar: aadhaar
        }).sort({ createdAt: -1 });

        const notifications = assignedEvidences.filter(ev => !ev.viewedByAnalyst);

        res.status(200).json({
            evidenceList: assignedEvidences,
            notifications: notifications
        });
    } catch (error) {
        console.error("Error fetching assigned evidences:", error);
        res.status(500).json({ message: "Error fetching assigned evidences.", error });
    }
};

exports.recordTransfer = async (req, res) => {
    try {
        const { evidenceId, transferredToAadhaar, caseId, evidenceName } = req.body;
        const user = req.user; // user info from authenticateToken middleware

        const transferRecord = new Transfer({
            evidenceId,
            transferredToAadhaar,
            transferredByAadhaar: user.aadhaar,
            caseId,
            evidenceName,
            transferredAt: new Date(),
            receivedAt: new Date(), 
            status: 'Transferred'
        });

        await transferRecord.save();

        res.json({ message: 'Transfer record saved successfully' });
    } catch (error) {
        console.error('Error saving transfer record:', error);
        res.status(500).json({ message: 'Error saving transfer record' });
    }
};

exports.getTransferredEvidenceForAnalyst = async (req, res) => {
    try {
        const aadhaar = req.user.aadhaar; // ✅ Extract from JWT

        if (!aadhaar) {
            return res.status(400).json({ message: "Aadhaar is required in JWT." });
        }

        // ✅ Step 1: Find distinct evidenceIds ever transferred to this analyst
        const transfers = await EvidenceTransfer.find({ transferredToAadhaar: aadhaar });
        const evidenceIds = transfers.map(t => t.evidenceId);

        // ✅ Step 2: For each evidenceId, check latest transfer
        const evidenceDetails = await Promise.all(
            evidenceIds.map(async (evidenceId) => {
                const latestTransfer = await EvidenceTransfer.findOne({ evidenceId })
                    .sort({ transferredAt: -1 }); // latest transfer

                if (!latestTransfer || latestTransfer.transferredToAadhaar !== aadhaar) {
                    return null; // skip if no longer with this analyst
                }

                const evidence = await Evidence.findOne({ evidenceId });

                if (!evidence) {
                    console.warn(`Evidence not found for evidenceId: ${evidenceId}`);
                    return null;
                }

                return {
                    transferId: latestTransfer._id,
                    transferredAt: latestTransfer.transferredAt,
                    receivedAt: latestTransfer.receivedAt,
                    transferredByAadhaar: latestTransfer.transferredByAadhaar,
                    transferredToAadhaar: latestTransfer.transferredToAadhaar,
                    status: latestTransfer.status,
                    evidence: {
                        evidenceId: evidence.evidenceId,
                        caseId: evidence.caseId,
                        evidenceName: evidence.evidenceName,
                        location: evidence.location,
                        evidenceDescription: evidence.evidenceDescription,
                        evidenceType: evidence.evidenceType,
                        evidenceCondition: evidence.evidenceCondition,
                        evidenceFields: evidence.evidenceFields || {},
                        files: evidence.files || [],
                        transferHistory: evidence.transferHistory || [],
                    }
                };
            })
        );

        const filteredEvidenceDetails = evidenceDetails.filter(item => item !== null);

        res.status(200).json({ evidenceList: filteredEvidenceDetails });
    } catch (error) {
        console.error("Error in getTransferredEvidenceForAnalyst:", error);
        res.status(500).json({ message: "Failed to fetch transferred evidences." });
    }
};

exports.getEvidenceFullDetails = async (req, res) => {
    try {
        const { evidenceId } = req.params;

        // 1️⃣ Fetch evidence details
        const evidence = await Evidence.findOne({ evidenceId });
        if (!evidence) {
            return res.status(404).json({ message: "Evidence not found" });
        }

        // 2️⃣ Fetch imaging details
        const imagingLogs = await ImagingLog.find({ evidenceId });

        // 3️⃣ Fetch integrity results
        const integrityLogs = await IntegrityLog.find({ evidenceId });

        // 4️⃣ Fetch analysis results
        const analysisResults = await AnalysisResult.find({ evidenceId });

        res.status(200).json({
            evidence,
            imagingLogs,
            integrityLogs,
            analysisLogs: analysisResults
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching detailed evidence data", error: err.message });
    }
};



exports.transferEvidenceToIO = async (req, res) => {
    try {
        const { evidenceId, aadhaar } = req.body;
        const cleanedAadhaar = aadhaar.trim();

        // ✅ Fetch evidence
        const evidence = await Evidence.findOne({ evidenceId });

        if (!evidence) {
            return res.status(404).json({ message: "Evidence not found." });
        }

        const caseId = evidence.caseId; 
        // ✅ Validate Aadhaar belongs to an Investigating Officer
        const investigatingOfficer = await User.findOne({
            aadhaar: cleanedAadhaar,
            role: { $regex: /^investigating officer$/i } // case-insensitive role check
        });

        if (!investigatingOfficer) {
            return res.status(404).json({
                message: "The provided Aadhaar does not belong to an Investigating Officer."
            });
        }

        // ✅ Fetch associated logs and findings
        const imagingLogs = await ImagingLog.find({ evidenceId });
        const integrityLogs = await IntegrityLog.find({ evidenceId });
        const analysisResults = await AnalysisResult.find({ evidenceId });

        // ✅ Transfer Evidence: Update assigned IO in evidence
        await Evidence.updateOne(
            { evidenceId },
            {
                $set: {
                    investigatingOfficerName: investigatingOfficer.fullName,
                    investigatingOfficerWallet: investigatingOfficer.walletAddress,
                    investigatingOfficerAadhaar: investigatingOfficer.aadhaar,
                    forensicsAnalystAadhaar: null, // Unassign from analyst
                    forensicsAnalystName: null,
                    forensicsAnalystWallet: null
                }
            }
        );

        await AnalystTransfer.create({
            evidenceId,
            caseId,
            transferredToAadhaar: cleanedAadhaar,
            transferredByAadhaar: req.user.aadhaar,
            evidenceDetails: evidence._id,
            imagingLogs,
            integrityLogs,
            analysisResults,
            transferredAt: new Date(),
            ReceivedAt: new Date(), // Set receivedAt to current time
        });


        res.status(200).json({
            message: `Evidence transferred successfully to Investigating Officer ${investigatingOfficer.fullName}.`
        });
    } catch (error) {
        console.error("Error transferring evidence to IO:", error);
        res.status(500).json({ message: "Error transferring evidence to Investigating Officer.", error: error.message });
    }
};

exports.getTransferredEvidenceForOfficer = async (req, res) => {
    try {
        console.log("=== Fetching transferred evidence for officer ===");

        const aadhaar = req.user?.aadhaar;
        console.log("Token payload Aadhaar:", aadhaar);

        if (!aadhaar) {
            console.log("Missing Aadhaar in token.");
            return res.status(400).json({ message: "Aadhaar missing in token payload." });
        }

        const transfers = await AnalystTransfer.find({ transferredToAadhaar: aadhaar })
            .sort({ transferredAt: -1 })
            .populate({ path: 'evidenceDetails', model: 'Evidence' });


        console.log(`Found ${transfers.length} transfers.`);

        const response = transfers.map((transfer) => {
            console.log("Transfer item:", transfer);

            return {
                transferId: transfer._id,
                transferredAt: transfer.transferredAt,
                transferredByAadhaar: transfer.transferredByAadhaar,
                transferredToAadhaar: transfer.transferredToAadhaar,
                status: transfer.status || "Transferred",
                evidence: transfer.evidenceDetails ? {
                    evidenceId: transfer.evidenceDetails.evidenceId,
                    caseId: transfer.evidenceDetails.caseId,
                    evidenceName: transfer.evidenceDetails.evidenceName,
                    description: transfer.evidenceDetails.description,
                    type: transfer.evidenceDetails.type,
                    condition: transfer.evidenceDetails.condition,
                    files: transfer.evidenceDetails.files || [],
                    imagingLogs: transfer.imagingLogs || [],
                    integrityLogs: transfer.integrityLogs || [],
                    analysisResults: transfer.analysisResults || []
                } : {}
            };
        });

        console.log("Sending response:", JSON.stringify(response, null, 2));

        res.status(200).json({ evidenceList: response });
    } catch (error) {
        console.error("Error fetching transferred evidence for officer:", error);
        res.status(500).json({ message: "Failed to fetch transferred evidence for officer.", error: error.message });
    }
};
