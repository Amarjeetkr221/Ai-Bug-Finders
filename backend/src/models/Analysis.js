const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    default: 'Untitled Project'
  },
  code: {
    type: String,
    required: [true, 'Please provide code for analysis']
  },
  language: {
    type: String,
    required: true,
    default: 'Auto-Detect'
  },
  summary: {
    type: String,
    default: ''
  },
  bugs: [{
    category: {
      type: String,
      enum: ['Syntax Errors', 'Runtime Errors', 'Logic Errors', 'Performance Problems', 'Memory Issues', 'Code Smells', 'Best Practices', 'Security Vulnerabilities'],
      required: true
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low', 'Informational'],
      required: true
    },
    line: Number,
    message: String,
    explanation: String
  }],
  metrics: {
    complexity: {
      type: String,
      default: 'Low'
    },
    readabilityScore: {
      type: Number,
      default: 0
    }, // 0 - 100
    maintainabilityScore: {
      type: Number,
      default: 0
    }, // 0 - 100
    overallQualityScore: {
      type: Number,
      default: 0
    }, // 0 - 100
    estimatedExecutionTime: {
      type: String,
      default: 'N/A'
    },
    estimatedMemoryUsage: {
      type: String,
      default: 'N/A'
    }
  },
  optimizationSuggestions: [String],
  fixedCode: {
    type: String,
    default: ''
  },
  lineExplanations: [{
    line: Number,
    originalLine: String,
    fixedLine: String,
    explanation: String
  }],
  confidenceScore: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for searching
AnalysisSchema.index({ language: 1, projectName: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);
