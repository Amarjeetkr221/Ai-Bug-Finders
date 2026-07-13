const express = require('express');
const router = express.Router();
const { runAnalysis, getHistory, getAnalysis, toggleFavorite, softDeleteAnalysis, deleteAnalysis, rateResponse, exportReport, askQuestion } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/scan', runAnalysis);
router.get('/history', getHistory);
router.get('/:id', getAnalysis);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/trash', softDeleteAnalysis);
router.delete('/:id', deleteAnalysis);
router.put('/:id/rate', rateResponse);
router.get('/:id/export', exportReport);
router.post('/:id/chat', askQuestion);

module.exports = router;
