const express = require('express');
const router = express.Router();
const controller = require('../controllers/aiController');

// Meal Plans
router.post('/plano/:type', controller.getMealPlan); // type: 'normal' or 'custo'

// Daily Tips
router.get('/dica/dia', controller.getDailyTip);

// Workout
router.post('/treino/analisar', controller.analyzeWorkout);

// Scanner
router.post('/scanner/veredito', controller.analyzeScanner);

// Reset (Dev tools)
router.delete('/reset', (req, res) => {
    // Implementation to clear specific collections if needed
    res.json({ message: "Reset endpoint" });
});

module.exports = router;