require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Case = require('../models/caseModel');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in the .env file');
    process.exit(1);
}

const generateRandomCaseId = () => `CS-${Math.floor(1000 + Math.random() * 9000)}`;

const cases = [
    {
        caseId: generateRandomCaseId(),
        caseName: 'Ransomware Attack',
        selectedOfficer: 'Inspector Vikram Singh',
        selectedOfficerWallet: '0x3040047887350358765cad4220632253A4b7915B',
        description: 'A ransomware attack on a major corporation.',
        location: 'Bengaluru',
        suspects: [
            { name: 'John Doe', age: 35, designation: 'IT Specialist', address: '123 Main St', phone: '1234567890', email: 'john.doe@example.com' }
        ],
        victims: [
            { name: 'Jane Smith', age: 28, designation: 'Manager', address: '456 Elm St', phone: '0987654321', email: 'jane.smith@example.com' }
        ],
        witnesses: [
            { name: 'Alice Johnson', age: 40, designation: 'Security Guard', address: '789 Oak St', phone: '1122334455', email: 'alice.johnson@example.com' }
        ],
        status: 'Active',
        updatedAt: new Date('2025-01-15T10:00:00Z') // Explicitly set updatedAt
    },
    {
        caseId: generateRandomCaseId(),
        caseName: 'Bank Fraud',
        selectedOfficer: 'Officer Priya Menon',
        selectedOfficerWallet: '0x1234567890abcdef1234567890abcdef12345678',
        description: 'A large-scale bank fraud involving multiple accounts.',
        location: 'Mumbai',
        suspects: [
            { name: 'Robert Brown', age: 45, designation: 'Bank Teller', address: '321 Pine St', phone: '2233445566', email: 'robert.brown@example.com' }
        ],
        victims: [
            { name: 'Emily Davis', age: 32, designation: 'Accountant', address: '654 Maple St', phone: '6677889900', email: 'emily.davis@example.com' }
        ],
        witnesses: [
            { name: 'Michael Wilson', age: 50, designation: 'Customer', address: '987 Birch St', phone: '3344556677', email: 'michael.wilson@example.com' }
        ],
        status: 'Under Investigation',
        updatedAt: new Date('2025-02-10T11:00:00Z') // Explicitly set updatedAt
    },
    {
        caseId: generateRandomCaseId(),
        caseName: 'Cyber Espionage',
        selectedOfficer: 'Detective Arun Kumar',
        selectedOfficerWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
        description: 'A cyber espionage case involving sensitive government data.',
        location: 'Delhi',
        suspects: [
            { name: 'David Clark', age: 38, designation: 'Hacker', address: '159 Cedar St', phone: '4455667788', email: 'david.clark@example.com' }
        ],
        victims: [
            { name: 'Sarah Miller', age: 30, designation: 'Government Official', address: '753 Willow St', phone: '9988776655', email: 'sarah.miller@example.com' }
        ],
        witnesses: [
            { name: 'James Anderson', age: 45, designation: 'IT Consultant', address: '951 Spruce St', phone: '5566778899', email: 'james.anderson@example.com' }
        ],
        status: 'Closed',
        updatedAt: new Date('2025-03-05T12:00:00Z') // Explicitly set updatedAt
    },
    {
        caseId: generateRandomCaseId(),
        caseName: 'Identity Theft',
        selectedOfficer: 'SI Ramesh Gupta',
        selectedOfficerWallet: '0x7890abcdef1234567890abcdef1234567890abcd',
        description: 'A case of identity theft affecting multiple individuals.',
        location: 'Chennai',
        suspects: [
            { name: 'William Harris', age: 42, designation: 'Freelancer', address: '852 Fir St', phone: '6677889900', email: 'william.harris@example.com' }
        ],
        victims: [
            { name: 'Olivia Martinez', age: 29, designation: 'Teacher', address: '357 Ash St', phone: '7766554433', email: 'olivia.martinez@example.com' }
        ],
        witnesses: [
            { name: 'Sophia Thompson', age: 35, designation: 'Neighbor', address: '159 Pine St', phone: '3344556677', email: 'sophia.thompson@example.com' }
        ],
        status: 'Active',
        updatedAt: new Date('2025-03-10T13:00:00Z') // Explicitly set updatedAt
    },
    {
        caseId: generateRandomCaseId(),
        caseName: 'Phishing Scam',
        selectedOfficer: 'DSP Sneha Iyer',
        selectedOfficerWallet: '0xabcdef7890abcdef1234567890abcdef12345678',
        description: 'A phishing scam targeting senior citizens.',
        location: 'Hyderabad',
        suspects: [
            { name: 'Charles Lee', age: 50, designation: 'Scammer', address: '951 Maple St', phone: '2233445566', email: 'charles.lee@example.com' }
        ],
        victims: [
            { name: 'Linda White', age: 65, designation: 'Retired', address: '753 Oak St', phone: '9988776655', email: 'linda.white@example.com' }
        ],
        witnesses: [
            { name: 'Barbara King', age: 70, designation: 'Neighbor', address: '357 Birch St', phone: '5566778899', email: 'barbara.king@example.com' }
        ],
        status: 'Under Investigation',
        updatedAt: new Date('2025-03-15T14:00:00Z') // Explicitly set updatedAt
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await Case.deleteMany({});
        await Case.insertMany(cases);
        console.log('✅ Database seeded with cases');
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
    });