const Blog = require('../models/Blog');
const Faq = require('../models/Faq');
const Testimonial = require('../models/Testimonial');
const Contact = require('../models/Contact');

// Seed default contents if empty
exports.seedDefaultContent = async (req, res) => {
  try {
    const faqCount = await Faq.countDocuments();
    if (faqCount === 0) {
      await Faq.create([
        { question: 'What programming languages does the AI Bug Detector support?', answer: 'We currently support 14 programming languages including Java, Python, C, C++, JavaScript, TypeScript, PHP, Go, Rust, Swift, Kotlin, SQL, HTML, and CSS.', order: 1 },
        { question: 'How accurate is the bug detection?', answer: 'The analysis uses advanced Gemini models paired with custom developer rulesets. It has an average diagnostic accuracy of 92% and highlights confidence ratings for every scan.', order: 2 },
        { question: 'What is the credit limit system?', answer: 'Free accounts get 5 scan credits to explore the platform. Upgrading to Premium User grants unlimited scans, faster response times, and Priority Queue access.', order: 3 }
      ]);
    }

    const testCount = await Testimonial.countDocuments();
    if (testCount === 0) {
      await Testimonial.create([
        { name: 'Sarah Jenkins', role: 'Lead Frontend Engineer', company: 'DevFlow Inc', content: 'AI Bug Detector saved my team hours during code reviews! The Monaco visual comparison is outstanding.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { name: 'David Chen', role: 'Staff Security Engineer', company: 'CyberGuard', content: 'The vulnerability scan caught multiple logic-based leaks in our authentication hooks before we deployed. Essential portfolio project!', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
      ]);
    }

    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.create([
        { title: 'Top Security Vulnerabilities in MERN Stack Applications', slug: 'mern-security-vulnerabilities', content: 'Securing React/Node apps requires proper CSRF, JWT, and input sanitation wrappers. Learn how to prevent injections using advanced validators...', author: 'AI Bug Team', tags: ['Security', 'MERN'], published: true },
        { title: 'Improving Code Maintainability with AI Reviewers', slug: 'improve-maintainability-ai', content: 'Static analysis tools are moving towards Large Language Models. Discover how to leverage Gemini to calculate code complexity and readability score instantly...', author: 'AI Bug Team', tags: ['AI', 'Refactoring'], published: true }
      ]);
    }

    res.status(200).json({ success: true, message: 'Content seeded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all FAQs
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all Blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Contact Message
exports.submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all contact fields.' });
  }
  try {
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, contact, message: 'Your message has been received! Our support agent will reply shortly.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
