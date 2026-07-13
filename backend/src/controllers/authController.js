const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../config/nodemailer');

// Sign JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_ai_bug_detector_jwt_token_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user = await User.create({
      name,
      email,
      password,
      credits: 5, // Free credits upon registering
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    // Send Verification Email
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    const message = `Welcome to AI Bug Detector! Please verify your email by clicking the link: ${verifyUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Welcome to AI Bug Detector!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up. Please verify your email address to unlock your free credits and start scanning code.</p>
        <a href="${verifyUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Verify Email Address</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendMail(email, 'Verify your email address - AI Bug Detector', message, html);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification email has been sent.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Verification token is invalid or has expired' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified. You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check email verification (optional block: let's allow login but warn or restrict if preferred, let's proceed)
    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user._id);

    // Strip password
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Login Mock/Handler
exports.googleLogin = async (req, res) => {
  const { token, profile } = req.body;
  // If profile is provided, find or create. Highly suitable for portfolio previews
  if (!profile || !profile.email) {
    return res.status(400).json({ success: false, message: 'Google profile payload is missing' });
  }

  try {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      // Create user
      user = await User.create({
        name: profile.name || 'Google User',
        email: profile.email,
        password: crypto.randomBytes(16).toString('hex'), // Random password since social sign-on
        avatar: profile.picture || '',
        isVerified: true, // Google accounts are auto-verified
        credits: 5
      });
    }

    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: jwtToken,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click this link: ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your account password. Click the button below to specify a new password. This link expires in 10 minutes.</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
        <p>If you did not request this password reset, please ignore this email.</p>
      </div>
    `;

    await sendMail(email, 'Reset your password - AI Bug Detector', message, html);

    res.status(200).json({ success: true, message: 'Password reset link sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    user.password = password; // pre-save hook hashes this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check current user session
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
