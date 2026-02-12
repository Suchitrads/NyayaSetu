require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const EvidenceIntegrity = require('../models/evidenceIntegrityModel');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in the .env file');
    process.exit(1);
}

const integrityData = [
    {
        evidenceId: "EVID001",
        evidenceType: "Fingerprint",
        hashValue: "abc123def456hash789",
        status: "Verified"
    },
    {
        evidenceId: "EVID002",
        evidenceType: "Blood Sample",
        hashValue: "sha256-example-blood",
        status: "Verified"
    },
    {
        evidenceId: "EVID003",
        evidenceType: "Weapon",
        hashValue: "sha256-example-weapon",
        status: "Tampered"
    },
    {
        evidenceId: "EVID004",
        evidenceType: "DNA Sample",
        hashValue: "sha256-example-dna",
        status: "Verified"
    },
    {
        evidenceId: "EVID005",
        evidenceType: "Footprint",
        hashValue: "sha256-example-footprint",
        status: "Pending"
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await EvidenceIntegrity.deleteMany({});
        await EvidenceIntegrity.insertMany(integrityData);
        console.log('✅ Evidence integrity data seeded');
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });
