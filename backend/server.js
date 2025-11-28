require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Database Connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ Database Error:', err));

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('NutriAI Elite Backend is Running 🚀');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});