const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    wallet: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    aadhaar: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;