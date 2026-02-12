const Case = require('../models/caseModel');
const User = require('../models/userModel');
const { logRegisterCase, logUpdateCase } = require('../utils/blockchainLogger'); // ✅ Blockchain logger import


const createCase = async (req, res, next) => {
    const {
        caseId,
        caseName,
        selectedOfficer,
        selectedOfficerWallet,
        description,
        location,
        suspects,
        victims,
        witnesses,
        status
    } = req.body;

    try {
        const newCase = new Case({
            caseId,
            caseName,
            selectedOfficer,
            selectedOfficerWallet,
            description,
            location,
            suspects,
            victims,
            witnesses,
            status
        });

        await newCase.save();

        // ✅ Log to blockchain
        try {
            await logRegisterCase(req.body);
        } catch (err) {
            console.error('Blockchain log failed (registerCase):', err.message);
        }

        res.status(201).json(newCase);
    } catch (error) {
        next(error);
    }
};

const getOfficers = async (req, res, next) => {
    try {
        const officers = await User.find({ role: 'Investigating Officer' });
        res.status(200).json(officers);
    } catch (error) {
        next(error);
    }
};

const getRecentCases = async (req, res, next) => {
    try {
        const recentCases = await Case.find().sort({ updatedAt: -1 }).limit(5);
        res.status(200).json(recentCases);
    } catch (error) {
        next(error);
    }
};

const getCaseSummary = async (req, res, next) => {
    try {
        const summary = await Case.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(summary);
    } catch (error) {
        next(error);
    }
};

const updateCase = async (req, res, next) => {
    const { caseId } = req.params;
    const {
        caseName,
        selectedOfficer,
        selectedOfficerWallet,
        description,
        location,
        suspects,
        victims,
        witnesses,
        status
    } = req.body;

    try {
        const caseItem = await Case.findOne({ caseId });

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        caseItem.caseName = caseName;
        caseItem.selectedOfficer = selectedOfficer;
        caseItem.selectedOfficerWallet = selectedOfficerWallet;
        caseItem.description = description;
        caseItem.location = location;
        caseItem.suspects = suspects;
        caseItem.victims = victims;
        caseItem.witnesses = witnesses;
        caseItem.status = status;

        await caseItem.save();

        // ✅ Log to blockchain
        try {
            await logUpdateCase({
                caseId,
                caseName,
                selectedOfficer,
                selectedOfficerWallet,
                description,
                location,
                suspects,
                victims,
                witnesses,
                status
            });
        } catch (err) {
            console.error('Blockchain log failed (updateCase):', err.message);
        }

        res.status(200).json(caseItem);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCase,
    getOfficers,
    getRecentCases,
    getCaseSummary,
    updateCase,

};

