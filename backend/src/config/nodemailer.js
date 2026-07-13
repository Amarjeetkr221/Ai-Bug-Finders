const nodemailer = require('nodemailer');

const createTransporter = () => {
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (isConfigured) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback: Console transporter for testing / local development
  console.log('Using fallback console transporter for email notifications.');
  return {
    sendMail: async (mailOptions) => {
      console.log('============== MOCK EMAIL SENT ==============');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body (Text): ${mailOptions.text}`);
      console.log('=============================================');
      return { messageId: 'mock-id-12345' };
    }
  };
};

module.exports = {
  transporter: createTransporter(),
  sendMail: async (to, subject, text, html) => {
    try {
      const activeTransporter = createTransporter();
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@aibugdetector.com',
        to,
        subject,
        text,
        html
      };
      return await activeTransporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email send failed:', error);
      return null;
    }
  }
};
