const Evidence = require('../models/evidenceModel');
const Transfer = require('../models/transferModel');
const AnalystTransfer = require('../models/analysttransferModel');
const { logTransferRecord }  = require('../utils/blockchainLogger'); // Only needed in POST/creation

const getCollectorToAnalystTransfersByCaseId = async (req, res) => {
    const { caseId } = req.params;

    try {
        const evidences = await Evidence.find({ caseId }).lean();
        if (!evidences.length) {
            return res.status(404).json({ message: 'No evidences found for this case' });
        }
        const evidenceIds = evidences.map(e => e.evidenceId);

        // Fetch all transfers for these evidences
        const transfers = await Transfer.find({
            evidenceId: { $in: evidenceIds },
            status: 'Transferred'
        }).sort({ transferredAt: -1 }).lean();

        const collectorToAnalystTransfers = transfers.map(t => ({
            evidenceId: t.evidenceId,
            caseId,
            transferredByAadhaar: t.transferredByAadhaar,
            transferredToAadhaar: t.transferredToAadhaar,
            transferredToWallet: t.transferredToWallet,
            transferredAt: t.transferredAt,
            receivedAt: t.receivedAt,
            status: t.status,
            remarks: t.remarks || ""
        }));

        res.status(200).json({ collectorToAnalyst: collectorToAnalystTransfers });
    } catch (error) {
        console.error('Error in getCollectorToAnalystTransfersByCaseId:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAnalystToIOTransfersByCaseId = async (req, res) => {
    const { caseId } = req.params;

    try {
        const transfers = await AnalystTransfer.find({ caseId }).sort({ transferredAt: -1 }).lean();

        const analystToIOTransfers = transfers.map(t => ({
            evidenceId: t.evidenceId,
            caseId: t.caseId,
            transferredByAadhaar: t.transferredByAadhaar,
            transferredToAadhaar: t.transferredToAadhaar,
            transferredToWallet: t.transferredToWallet,
            transferredAt: t.transferredAt,
            receivedAt: t.receivedAt,
            status: t.status,
            remarks: t.remarks || ""
        }));

        res.status(200).json({ analystToIO: analystToIOTransfers });
    } catch (error) {
        console.error('Error in getAnalystToIOTransfersByCaseId:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    getCollectorToAnalystTransfersByCaseId,
    getAnalystToIOTransfersByCaseId,
    
};