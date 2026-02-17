const mongoose = require("mongoose");
const User = require("../models/userModel");

// 🔹 CHANGE THIS IF USING ATLAS
const MONGO_URI = "mongodb://localhost:27017/NyayaSetu";

const users = [
  {
    fullName: "SI Rajesh Kumar",
    walletAddress: "0xe85fA867bC86E14775776320c1739570180F899C",
    role: "Collector",
    email: "rajesh.kumar@example.com",
    mobile: "9876543210",
    dateOfBirth: new Date("1985-01-01"),
    aadhaar: "123456789012"
  },
  {
    fullName: "Investigation Officer One",
    walletAddress: "0x2222222222222222222222222222222222222222",
    role: "Investigating Officer",
    email: "io1@nyayasetu.com",
    mobile: "9876543211",
    dateOfBirth: new Date("1992-02-02"),
    aadhaar: "222233334444"
  },
  {
    fullName: "Inspector Vikram Singh",
    walletAddress: "0x3040047887350358765cad4220632253A4b7915B",
    role: "Investigating Officer",
    email: "vikram.singh@example.com",
    mobile: "9876543212",
    dateOfBirth: new Date("1988-03-03"),
    aadhaar: "345678901234"
  },
  {
    fullName: "Admin Priya Verma",
    walletAddress: "0x8DA1A0CCEaA8744570B9662c09CDe87F9547773B",
    role: "Admin",
    email: "priya.verma@example.com",
    mobile: "9876543213",
    dateOfBirth: new Date("1982-04-04"),
    aadhaar: "456123789123"
  },
  {
    fullName: "SI Arjun Patel",
    walletAddress: "0x4c7dF51f4586CAfeE92034fdF3bB000138B3c795",
    role: "Collector",
    email: "arjun.patel@example.com",
    mobile: "9876543214",
    dateOfBirth: new Date("1995-05-05"),
    aadhaar: "567890123456"
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    let inserted = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        await User.create(user);
        console.log("✅ Inserted:", user.fullName);
        inserted++;
      } catch (err) {
        if (err.code === 11000) {
          console.log("⚠ Skipped duplicate:", user.fullName);
          skipped++;
        } else {
          console.log("❌ Error inserting:", user.fullName);
          console.log(err.message);
        }
      }
    }

    console.log("\n📊 SEED SUMMARY");
    console.log("Inserted:", inserted);
    console.log("Skipped:", skipped);

    process.exit();

  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seedUsers();
