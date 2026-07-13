const express = require('express');
const router = express.Router();
const { getStats, getUsers, updateUserRole, deleteUser, getAllAnalyses, deleteAnalysisAdmin, getSettings, updateSettings, broadcastNotification, getContacts, replyContact, createFaq, deleteFaq, createTestimonial, deleteTestimonial, createBlog, deleteBlog } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under this and authorize to Admin only
router.use(protect, authorize('Admin'));

// System stats
router.get('/stats', getStats);

// User control
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Analysis control
router.get('/analyses', getAllAnalyses);
router.delete('/analyses/:id', deleteAnalysisAdmin);

// Web configuration
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Communication
router.post('/broadcast', broadcastNotification);
router.get('/contacts', getContacts);
router.post('/contacts/:id/reply', replyContact);

// Content controls
router.post('/faqs', createFaq);
router.delete('/faqs/:id', deleteFaq);
router.post('/testimonials', createTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.post('/blogs', createBlog);
router.delete('/blogs/:id', deleteBlog);

module.exports = router;
