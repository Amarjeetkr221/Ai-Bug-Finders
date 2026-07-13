const Analysis = require('../models/Analysis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeCode, chatWithAI } = require('../utils/geminiClient');
const { generateHTMLReport, generateMarkdownReport } = require('../utils/reportGenerator');

// Run Code Analysis
exports.runAnalysis = async (req, res) => {
  const { code, language, projectName } = req.body;
  const user = req.user;

  if (!code || code.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide code for analysis.' });
  }

  // Credit limits checks
  if (user.role === 'User' && user.credits <= 0) {
    return res.status(403).json({
      success: false,
      message: 'You have run out of credits. Please upgrade to Premium or buy more credits.'
    });
  }

  try {
    // Invoke Gemini core
    const result = await analyzeCode(code, language);

    // Decrement credits for non-premium
    if (user.role === 'User') {
      user.credits = Math.max(0, user.credits - 1);
      await user.save();
    }

    // Save Analysis log
    const analysis = await Analysis.create({
      user: user._id,
      projectName: projectName || 'Untitled Project',
      code,
      language: language === 'Auto-Detect' ? (result.language || 'Code Snippet') : language,
      summary: result.summary,
      bugs: result.bugs || [],
      metrics: result.metrics,
      optimizationSuggestions: result.optimizationSuggestions || [],
      fixedCode: result.fixedCode || code,
      lineExplanations: result.lineExplanations || [],
      confidenceScore: result.confidenceScore || 85
    });

    // Notify User
    await Notification.create({
      user: user._id,
      title: 'Analysis Completed',
      message: `Your project '${analysis.projectName}' has been analyzed successfully. Quality Score: ${analysis.metrics.overallQualityScore}/100.`,
      type: 'Analysis Completed'
    });

    // Notify Credits Low
    if (user.role === 'User' && user.credits <= 1) {
      await Notification.create({
        user: user._id,
        title: 'Credits Low',
        message: `You only have ${user.credits} credit(s) remaining. Upgrade to Premium for unlimited scans.`,
        type: 'Credits Low'
      });
    }

    res.status(200).json({
      success: true,
      analysis,
      credits: user.credits
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analysis failed: ' + error.message });
  }
};

// Retrieve User History
exports.getHistory = async (req, res) => {
  const { language, severity, isFavorite, search, sort } = req.query;
  let query = { user: req.user._id, isDeleted: false };

  if (language && language !== 'All') {
    query.language = language;
  }
  if (isFavorite === 'true') {
    query.isFavorite = true;
  }
  if (severity && severity !== 'All') {
    query['bugs.severity'] = severity;
  }
  if (search) {
    query.projectName = { $regex: search, $options: 'i' };
  }

  try {
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'quality-asc') sortOption = { 'metrics.overallQualityScore': 1 };
    if (sort === 'quality-desc') sortOption = { 'metrics.overallQualityScore': -1 };

    const analyses = await Analysis.find(query).sort(sortOption);
    res.status(200).json({ success: true, count: analyses.length, analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Analysis Details
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis || analysis.isDeleted) {
      return res.status(404).json({ success: false, message: 'Analysis record not found' });
    }
    // Verify ownership
    if (analysis.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this analysis' });
    }
    res.status(200).json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    analysis.isFavorite = !analysis.isFavorite;
    await analysis.save();
    res.status(200).json({ success: true, isFavorite: analysis.isFavorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete (move to trash)
exports.softDeleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    analysis.isDeleted = true;
    await analysis.save();
    res.status(200).json({ success: true, message: 'Analysis moved to trash.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// permanently delete analysis
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    await analysis.deleteOne();
    res.status(200).json({ success: true, message: 'Analysis permanently deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save Rating & Feedback
exports.rateResponse = async (req, res) => {
  const { rating, feedback } = req.body;
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    analysis.rating = rating;
    analysis.feedback = feedback || '';
    await analysis.save();
    res.status(200).json({ success: true, message: 'Feedback saved successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export Reports
exports.exportReport = async (req, res) => {
  const { format } = req.query; // 'json', 'html', 'markdown'
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    if (format === 'markdown') {
      const content = generateMarkdownReport(analysis);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename=report-${analysis._id}.md`);
      return res.send(content);
    } else if (format === 'html') {
      const content = generateHTMLReport(analysis);
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename=report-${analysis._id}.html`);
      return res.send(content);
    } else {
      // JSON format is the default fallback
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=report-${analysis._id}.json`);
      return res.json(analysis);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Chat Side Assistant
exports.askQuestion = async (req, res) => {
  const { message, history } = req.body;
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Code context not found.' });
    }

    const aiResponse = await chatWithAI(
      analysis.code,
      analysis.language,
      history || [],
      message
    );

    res.status(200).json({ success: true, response: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
