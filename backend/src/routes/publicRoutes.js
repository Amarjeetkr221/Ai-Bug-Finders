const express = require('express');
const router = express.Router();
const { seedDefaultContent, getFaqs, getTestimonials, getBlogs, submitContact } = require('../controllers/publicController');

router.post('/seed', seedDefaultContent);
router.get('/faqs', getFaqs);
router.get('/testimonials', getTestimonials);
router.get('/blogs', getBlogs);
router.post('/contact', submitContact);

module.exports = router;
