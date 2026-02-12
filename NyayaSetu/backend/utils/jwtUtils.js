const jwt = require('jsonwebtoken');

exports.signToken = (userId, role, aadhaar, wallet) => {
    return jwt.sign(
        { id: userId, role, aadhaar, wallet },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
    );
};

exports.verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};