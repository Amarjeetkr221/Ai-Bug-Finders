const User = require('../models/User');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// Update User Profile
exports.updateProfile = async (req, res) => {
  const { name, bio, skills, country, github, linkedin, portfolio, avatar } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (country !== undefined) user.country = country;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    res.status(200).json({ success: true, user, message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // Pre-save hooks will bcrypt hash this
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'Account deleted permanently.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Buy Credits / Premium Plan Mock
exports.upgradePremium = async (req, res) => {
  const { plan } = req.body; // 'premium' or 'credits-10'
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (plan === 'premium') {
      user.role = 'Premium User';
      user.credits = 9999; // Unlimited simulator
    } else if (plan === 'credits-10') {
      user.credits += 10;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: plan === 'premium' ? 'Upgraded to Premium plan successfully!' : '10 credits added to your account.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Two Factor Authentication
exports.toggleTwoFactor = async (req, res) => {
  const { enable } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.twoFactorEnabled = enable;
    await user.save();
    res.status(200).json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: enable ? 'Two-Factor Authentication activated.' : 'Two-Factor Authentication deactivated.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { user: req.user.id },
        { user: null } // Broadcasts
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Notification as Read
exports.readNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

