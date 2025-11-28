const mongoose = require('mongoose');

// User Schema (Optional, if you want to store profiles server-side)
const UserSchema = new mongoose.Schema({
    userId: String,
    profileData: Object,
    lastUpdate: { type: Date, default: Date.now }
});

// Meal Plan Schema
const MealPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can use device ID or Auth ID
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    type: { type: String, enum: ['Normal', 'Custo-Benefício'], required: true },
    planData: { type: Object, required: true },
    observation: String,
    createdAt: { type: Date, default: Date.now }
});

// Daily Tip Schema
const DailyTipSchema = new mongoose.Schema({
    date: { type: String, unique: true }, // One global tip per day or per user
    content: Object,
    createdAt: { type: Date, default: Date.now }
});

// Scanner Verdict Schema
const ScannerSchema = new mongoose.Schema({
    userId: String,
    verdict: String, // Bom, Ruim, Neutro
    score: Number,
    data: Object,
    imageUrl: String, // Or base64 stored (not recommended for large scale but ok for MVP)
    createdAt: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    MealPlan: mongoose.model('MealPlan', MealPlanSchema),
    DailyTip: mongoose.model('DailyTip', DailyTipSchema),
    Scanner: mongoose.model('Scanner', ScannerSchema)
};