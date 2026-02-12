// userRouter.js
const express = require('express');
const User = require('../models/userModel');
const userController = require('../controllers/userController');
const { validateAadhaar, validateInvestigationOfficerAadhaar } = require("../controllers/userController");
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();



// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Get user by wallet address
router.get('/wallet/:wallet', userController.getUserByWallet);

// Create user
router.post('/', userController.createUser);

router.post('/validate-aadhaar', validateAadhaar);
router.post('/validate-investigation-officer-aadhaar', validateInvestigationOfficerAadhaar);

router.get('/by-aadhaar/:aadhaar', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({ aadhaar: req.params.aadhaar }).lean();
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            id: user._id,
            name: user.fullName,
            aadhaar: user.aadhaar,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
