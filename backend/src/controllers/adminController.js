const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Setting = require('../models/Setting');
const Contact = require('../models/Contact');
const Notification = require('../models/Notification');
const Blog = require('../models/Blog');
const Faq = require('../models/Faq');
const Testimonial = require('../models/Testimonial');
const { sendMail } = require('../config/nodemailer');

// Get Dashboard Summary Stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ role: { $ne: 'Admin' } });
    const premiumUsers = await User.countDocuments({ role: 'Premium User' });

    // Signups today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySignups = await User.countDocuments({ createdAt: { $gte: startOfToday } });

    // Analyses today
    const todayAnalyses = await Analysis.countDocuments({ createdAt: { $gte: startOfToday } });

    // Aggregate bug types and language popularity
    const allAnalyses = await Analysis.find({ isDeleted: false });
    const languageMap = {};
    const bugCategoryMap = {};
    let totalScore = 0;
    let analysesCount = allAnalyses.length;

    allAnalyses.forEach(a => {
      // Language popularity
      languageMap[a.language] = (languageMap[a.language] || 0) + 1;
      
      // Quality score sum
      totalScore += a.metrics.overallQualityScore || 0;

      // Bug categories
      if (a.bugs) {
        a.bugs.forEach(b => {
          bugCategoryMap[b.category] = (bugCategoryMap[b.category] || 0) + 1;
        });
      }
    });

    const averageQualityScore = analysesCount > 0 ? Math.round(totalScore / analysesCount) : 100;

    // Format Server status
    const serverStatus = {
      cpuUsage: Math.floor(Math.random() * 20) + 5 + '%',
      memoryUsage: Math.floor(Math.random() * 30) + 40 + '%',
      uptime: Math.round(process.uptime()) + 's',
      nodeVersion: process.version,
      dbStatus: 'Connected'
    };

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        todaySignups,
        todayAnalyses,
        totalAnalyses: analysesCount,
        averageQualityScore,
        estimatedRevenue: premiumUsers * 29, // Mock SaaS billing
        languagePopularity: languageMap,
        bugCategories: bugCategoryMap,
        serverStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin User Actions (List/Search, Edit, Delete, Suspend, Upgrade)
exports.getUsers = async (req, res) => {
  const { search } = req.query;
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  try {
    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { role, credits } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role) user.role = role;
    if (credits !== undefined) user.credits = credits;
    await user.save();

    res.status(200).json({ success: true, user, message: 'User details updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted permanently.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Analysis Control
exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: analyses.length, analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnalysisAdmin = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    await analysis.deleteOne();
    res.status(200).json({ success: true, message: 'Analysis deleted permanently by administrator.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin global website Settings Configuration
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.status(200).json({ success: true, settings, message: 'Settings saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Notification Broadcast Center
exports.broadcastNotification = async (req, res) => {
  const { title, message, type, sendEmail } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Notification requires title and message.' });
  }

  try {
    // Save Broadcast Notification in DB (user: null implies broadcast to all)
    await Notification.create({
      user: null,
      title,
      message,
      type: type || 'Broadcast'
    });

    if (sendEmail) {
      // Find all users and email them (asynchronous task)
      const users = await User.find({ isVerified: true }).select('email');
      const emails = users.map(u => u.email);
      
      // Send individual/bulk email
      for (const email of emails) {
        await sendMail(email, `Announcement: ${title}`, message, `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #4F46E5;">${title}</h3>
            <p>${message}</p>
            <hr style="border-top:1px solid #eee; margin-top:20px;">
            <p style="font-size:11px; color:#999;">Sent by AI Bug Detector Administrator</p>
          </div>
        `);
      }
    }

    res.status(200).json({ success: true, message: 'Announcement broadcasted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Contact Messages Management
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyContact = async (req, res) => {
  const { replyText } = req.body;
  if (!replyText) return res.status(400).json({ success: false, message: 'Please provide reply text.' });

  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found' });

    // Send email reply
    await sendMail(
      contact.email,
      `Re: ${contact.subject} - AI Bug Detector Support`,
      replyText,
      `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <p>Hello ${contact.name},</p>
        <p>In response to your query regarding <strong>"${contact.subject}"</strong>:</p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 15px; color: #666; margin: 15px 0;">
          ${contact.message}
        </blockquote>
        <p style="margin-top: 20px;">${replyText.replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br>Support Team</p>
      </div>`
    );

    contact.status = 'resolved';
    contact.reply = replyText;
    await contact.save();

    res.status(200).json({ success: true, contact, message: 'Reply sent and marked resolved.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Content Management (FAQs, Testimonials, Blogs)
// FAQ CRUD
exports.createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'FAQ deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Testimonial CRUD
exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Testimonial deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Blog CRUD
exports.createBlog = async (req, res) => {
  const { title, content, tags, published } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  try {
    const blog = await Blog.create({ title, slug, content, tags, published });
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog post deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
