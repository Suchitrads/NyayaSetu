const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    caseId: { type: String, required: true, unique: true },
    caseName: { type: String, required: true },
    selectedOfficer: { type: String, required: true },
    selectedOfficerWallet: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    suspects: [{ name: String, age: Number, designation: String, address: String, phone: String, email: String }],
    victims: [{ name: String, age: Number, designation: String, address: String, phone: String, email: String }],
    witnesses: [{ name: String, age: Number, designation: String, address: String, phone: String, email: String }],
    status: { type: String, required: true },
    summary: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);