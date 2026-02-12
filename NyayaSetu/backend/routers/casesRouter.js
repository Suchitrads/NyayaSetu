const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { createCase, getOfficers, getRecentCases, getCaseSummary, updateCase } = require('../controllers/caseController');
const Case = require('../models/caseModel');
const jwt = require("jsonwebtoken");

const router = express.Router();


// router.get('/cases', authenticate, async (req, res) => {
//     try {
//         const cases = await Case.find(); // No filter!
//         res.status(200).json(cases);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to fetch cases', error: error.message });
//     }
// });

// router.get('/cases', authenticate, async (req, res) => {
//     try {
//         // Get JWT token from Authorization header
//         const token = req.headers.authorization?.split(" ")[1];
//         if (!token) return res.status(401).json({ error: "No token provided" });

//         // Decode JWT to get officer Aadhaar/ID
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const officerWallet = decoded.wallet;

//         // Find cases registered by this officer
//         const cases = await Case.find({ selectedOfficerWallet: officerWallet });
//         res.status(200).json(cases);
//     } catch (error) {
//         console.error('Error fetching cases:', error);
//         res.status(500).json({ message: 'Failed to fetch cases', error: error.message });
//     }
// });

router.get('/cases', authenticate, async (req, res) => {
    try {
        // Get JWT token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        // Decode JWT to get user info
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let cases;
        if (decoded.role === 'admin') {
            try {
                const cases = await Case.find(); // No filter!
                res.status(200).json(cases);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch cases', error: error.message });
            }
        } else {
            const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });

        // Decode JWT to get officer Aadhaar/ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const officerWallet = decoded.wallet;

            cases = await Case.find({ selectedOfficerWallet: officerWallet });
        }
        res.status(200).json(cases);
    } catch (error) {
        console.error('Error fetching cases:', error);
        res.status(500).json({ message: 'Failed to fetch cases', error: error.message });
    }
});

router.get('/cases/recent', authenticate, async (req, res) => {
    try {
        await getRecentCases(req, res);
    } catch (error) {
        console.error('Error fetching recent cases:', error);
        res.status(500).json({ message: 'Failed to fetch recent cases', error: error.message });
    }
});

router.get('/cases/summary', authenticate, async (req, res) => {
    try {
        await getCaseSummary(req, res);
    } catch (error) {
        console.error('Error fetching case summary:', error);
        res.status(500).json({ message: 'Failed to fetch case summary', error: error.message });
    }
});

router.get('/cases/:caseId', authenticate, async (req, res) => {
    try {
        const caseItem = await Case.findOne({ caseId: req.params.caseId });
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.status(200).json(caseItem);
    } catch (error) {
        console.error('Error fetching case details:', error);
        res.status(500).json({ message: 'Failed to fetch case details', error: error.message });
    }
});

router.post('/cases', authenticate, async (req, res) => {
    try {
        await createCase(req, res);
    } catch (error) {
        console.error('Error creating case:', error);
        res.status(500).json({ message: 'Failed to create case', error: error.message });
    }
});

router.put('/cases/:caseId', authenticate, async (req, res) => {
    try {
        await updateCase(req, res);
    } catch (error) {
        console.error('Error updating case:', error);
        res.status(500).json({ message: 'Failed to update case', error: error.message });
    }
});

router.get('/officers', authenticate, async (req, res) => {
    try {
        await getOfficers(req, res);
    } catch (error) {
        console.error('Error fetching officers:', error);
        res.status(500).json({ message: 'Failed to fetch officers', error: error.message });
    }
});

router.put('/cases/:caseId/summary', authenticate, async (req, res) => {
    try {
        const { summary } = req.body;
        const updatedCase = await Case.findOneAndUpdate(
            { caseId: req.params.caseId },
            { summary },
            { new: true }
        );
        if (!updatedCase) {
            return res.status(404).json({ message: 'Case not found' });
        }
        res.status(200).json(updatedCase);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update summary', error: error.message });
    }
});


module.exports = router;