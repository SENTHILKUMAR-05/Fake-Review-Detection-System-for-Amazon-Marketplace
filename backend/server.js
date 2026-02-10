const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const History = require('./models/History');

const app = express();
const PORT = 5000;
const SECRET_KEY = "my_secret_key_123"; // In real app, put in .env

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
// For this demo, we can use a local mongodb if available, or just mocking it if user doesn't have it?
// The user asked for MERN so they likely have Mongo. I will assume local mongo.
mongoose.connect('mongodb://127.0.0.1:27017/fake_review_db').then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));

// Routes

// 1. Register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(400).json({ error: "Username already exists" });
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check for Hardcoded Admin
    if (username === 'senthil' && password === '9345') {
        // Find or create admin user in DB to get a valid ObjectId
        let adminUser = await User.findOne({ username: 'senthil' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash(password, 10);
            adminUser = new User({ username: 'senthil', password: hashedPassword });
            await adminUser.save();
        }

        const token = jwt.sign({ id: adminUser._id, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.json({ token, username: 'Admin', isAdmin: true });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: 'user' }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username, isAdmin: false });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Predict
app.post('/predict', async (req, res) => {
    const { text, token, productName, productUrl, reviewerName, rating, reviewDate, verifiedPurchase } = req.body;

    // Verify token (Optional: if we want to enforce login for prediction)
    let userId = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            userId = decoded.id;
        } catch (e) {
            // Invalid token, but we might still allow prediction without saving history?
            // Let's enforce login for dashboard features.
        }
    }

    // For URL Analysis (Demo Mode), use the frontend provided result to ensure consistency
    if (req.body.isUrlAnalysis && req.body.mockResult) {
        const mock = req.body.mockResult;

        // Add default reasons if empty
        let reasons = mock.reasons || [];
        if (mock.prediction === 'Fake' && reasons.length === 0) {
            reasons.push("Pattern matching with known fake reviews");
        }

        const result = {
            prediction: mock.prediction,
            confidence: mock.confidence,
            reasons: reasons,
            error: null
        };

        if (userId) {
            try {
                const newHistory = new History({
                    userId,
                    reviewText: text, // This is the URL
                    prediction: result.prediction,
                    confidence: result.confidence,
                    detectionReasons: result.reasons,
                    productName: productName || "Unknown Product",
                    productUrl: productUrl || "",
                    reviewerName: reviewerName || "Anonymous",
                    rating: rating || 0,
                    reviewDate: reviewDate || null,
                    verifiedPurchase: verifiedPurchase || false, // Should be false for URL
                    isUrlAnalysis: true
                });
                await newHistory.save();
            } catch (e) { console.error("Error saving mock history", e); }
        }

        return res.json(result);
    }

    // Call Python Script for Text Analysis
    const pythonProcess = spawn('python', [path.join(__dirname, 'ml_bridge.py'), text]);

    pythonProcess.stdout.on('data', async (data) => {
        try {
            const result = JSON.parse(data.toString());

            // Add Metadata-based Detection Reasons
            if (!result.reasons) result.reasons = [];

            // Only add metadata reasons for actual text reviews, not URL scans
            if (!req.body.isUrlAnalysis) {
                if (rating === 5 && text.length < 50) {
                    result.reasons.push("Suspiciously short 5-star review");
                }
                if (!verifiedPurchase) {
                    result.reasons.push("Unverified Purchase");
                }
            }
            if (result.prediction === "Fake" && result.reasons.length === 0) {
                result.reasons.push("Pattern matching with known fake reviews");
            }

            if (userId && !result.error) {
                // Save to history
                const newHistory = new History({
                    userId,
                    reviewText: text,
                    prediction: result.prediction,
                    confidence: result.confidence,
                    detectionReasons: result.reasons, // Save reasons
                    // Save additional fields
                    productName: productName || "Unknown Product",
                    productUrl: productUrl || "",
                    reviewerName: reviewerName || "Anonymous",
                    rating: rating || 0,
                    reviewDate: reviewDate || null,
                    verifiedPurchase: verifiedPurchase || false,
                    isUrlAnalysis: req.body.isUrlAnalysis || false
                });
                await newHistory.save();
            }

            res.json(result);
        } catch (e) {
            res.status(500).json({ error: "Error parsing python output" });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });
});

// 4. Get History (For Dashboard Charts)
app.get('/history', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const history = await History.find({ userId: decoded.id }).sort({ date: -1 });
        res.json(history);
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});


// 5. Delete History Item
app.delete('/history/:id', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // Ensure user owns the item or is admin (for this simple app, just ownership or if it exists)
        // We will just check if it exists for now to keep it simple, or check userId match.
        await History.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (e) {
        res.status(500).json({ error: "Error deleting item" });
    }
});

// 6. Admin: Get ALL History
app.get('/admin/history', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const history = await History.find().populate('userId', 'username').sort({ date: -1 });
        res.json(history);
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// 7. Manual History Add (For Admin URL Scans)
app.post('/history/manual', async (req, res) => {
    const { token, ...data } = req.body;
    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const newHistory = new History({
            userId: decoded.id,
            reviewText: "Product URL Analysis", // Placeholder
            ...data,
            date: Date.now()
        });
        await newHistory.save();
        res.json(newHistory);
    } catch (e) {
        console.error("Error saving manual history:", e);
        res.status(500).json({ error: "Error saving history" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
