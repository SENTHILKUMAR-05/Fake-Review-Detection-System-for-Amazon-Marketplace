const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewText: { type: String, required: true },

    // New Fields
    productName: { type: String, default: "Unknown Product" },
    productUrl: { type: String, default: "" },
    reviewerName: { type: String, default: "Anonymous" },
    rating: { type: Number, default: 0 },
    reviewDate: { type: Date, default: null },
    verifiedPurchase: { type: Boolean, default: false },
    isUrlAnalysis: { type: Boolean, default: false },

    detectionReasons: { type: [String], default: [] },
    prediction: { type: String, required: true }, // "Fake" or "Real"
    confidence: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
