// userController.js
const User = require('../models/userModel');

exports.getUserByWallet = async (req, res) => {
    try {
        const { wallet } = req.params;
        const user = await User.findOne({ wallet });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error });
    }
};



exports.validateAadhaar = async (req, res) => {
    try {
        const { aadhaar } = req.body;
        if (!aadhaar || aadhaar.trim() === "") {
            return res.status(400).json({ message: "Aadhaar address is required." });
        }

        const cleanedAadhaar = aadhaar.trim();
        const user = await User.findOne({
            aadhaar: cleanedAadhaar,
            role: { $regex: /forensic analyst/i }
        });

        if (!user) {
            return res.status(404).json({ message: "Aadhaar address not found or user is not a Forensic Analyst." });
        }

        res.status(200).json({
            message: "Aadhaar is valid.",
            name: user.fullName,
            walletAddress: user.walletAddress
        });
    } catch (error) {
        console.error("Error validating Aadhaar:", error);
        res.status(500).json({ message: "Internal server error while validating Aadhaar." });
    }
};

exports.validateInvestigationOfficerAadhaar = async (req, res) => {
    try {
        const { aadhaar } = req.body;
        if (!aadhaar || aadhaar.trim() === "") {
            return res.status(400).json({ message: "Aadhaar address is required." });
        }

        const cleanedAadhaar = aadhaar.trim();
        const user = await User.findOne({
            aadhaar: cleanedAadhaar,
            role: { $regex: /investigating officer/i }
        });

        if (!user) {
            return res.status(404).json({
                message: "Aadhaar address not found or user is not an Investigation Officer."
            });
        }

        res.status(200).json({
            message: "Aadhaar is valid.",
            name: user.fullName,
            walletAddress: user.walletAddress
        });
    } catch (error) {
        console.error("Error validating Investigation Officer Aadhaar:", error);
        res.status(500).json({ message: "Internal server error while validating Aadhaar." });
    }
};
