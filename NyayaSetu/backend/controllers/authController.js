const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { signToken } = require('../utils/jwtUtils');

exports.login = async (req, res) => {
    try {
        const { aadhaar, walletAddress } = req.body;

if (!aadhaar || !walletAddress) {
    return res.status(400).json({ message: 'Aadhaar and Wallet Address are required' });
}

const user = await User.findOne({ aadhaar, walletAddress });

if (!user) {
    return res.status(401).json({ message: 'Invalid Aadhaar or Wallet Address' });
}

const token = signToken(
    user._id,
    user.role,
    user.aadhaar,
    user.walletAddress
);

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
