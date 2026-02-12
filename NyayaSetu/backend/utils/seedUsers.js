const mongoose = require('mongoose');
const User = require('../models/userModel');

const users = [
    {
        fullName: "SI Rajesh Kumar",
        wallet: "0xe85fA867bC86E14775776320c1739570180F899C",
        role: "Collector",
        email: "rajesh.kumar@example.com",
        mobile: "9876543210",
        dateOfBirth: "1985-01-01",
        aadhaar: "123456789012"
    },
    {
        fullName: "Inspector Anjali Sharma",
        wallet: "0x43cB5f534A526a66B562bE6c94B96b7b47c5640a",
        role: "Analyst",
        email: "anjali.sharma@example.com",
        mobile: "9876543211",
        dateOfBirth: "1990-02-02",
        aadhaar: "234567890123"
    },
    {
        fullName: "Inspector Vikram Singh",
        wallet: "0x3040047887350358765cad4220632253A4b7915B",
        role: "Investigating Officer",
        email: "vikram.singh@example.com",
        mobile: "9876543212",
        dateOfBirth: "1988-03-03",
        aadhaar: "345678901234"
    },
    {
        fullName: "Admin Priya Verma",
        wallet: "0x8DA1A0CCEaA8744570B9662c09CDe87F9547773B",
        role: "Admin",
        email: "priya.verma@example.com",
        mobile: "9876543213",
        dateOfBirth: "1982-04-04",
        aadhaar: "456123789123"
    },
    {
        fullName: "SI Arjun Patel",
        wallet: "0x4c7dF51f4586CAfeE92034fdF3bB000138B3c795",
        role: "Collector",
        email: "arjun.patel@example.com",
        mobile: "9876543214",
        dateOfBirth: "1995-05-05",
        aadhaar: "567890123456"
    }
];

mongoose.connect('mongodb://localhost:27017/NyayaSetu')
    .then(() => {
        console.log('Connected to MongoDB');
        return User.insertMany(users);
    })
    .then(() => {
        console.log('Users inserted successfully');
        mongoose.disconnect();
    })
    .catch((error) => {
        console.error('Error inserting users:', error);
        mongoose.disconnect();
    });