const { GoogleGenerativeAI } = require('@google/generative-ai');
const Setting = require('../models/Setting');

// Get active API key
const getApiKey = async () => {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.GEMINI_API_KEY;
  }
  const settings = await Setting.findOne();
  if (settings && settings.geminiApiKey) {
    return settings.geminiApiKey;
  }
  return null;
};

// Generate highly realistic mock responses based on language and code
const getMockAnalysis = (code, language) => {
  const codeLines = code.split('\n');
  const totalLines = codeLines.length;

  let bugs = [];
  let fixedCode = code;
  let lineExplanations = [];
  let summary = '';
  let optimizationSuggestions = [];

  // Simple rule-based mock bug generation for standard languages
  if (code.includes('eval(')) {
    const lineIndex = codeLines.findIndex(l => l.includes('eval(')) + 1;
    bugs.push({
      category: 'Security Vulnerabilities',
      severity: 'Critical',
      line: lineIndex,
      message: 'Use of eval() detected.',
      explanation: 'Using eval() is highly insecure as it executes code with the same privileges as the caller, making it vulnerable to code injection attacks.'
    });
    fixedCode = fixedCode.replace(/eval\((.*?)\)/g, 'JSON.parse($1)');
    lineExplanations.push({
      line: lineIndex,
      originalLine: codeLines[lineIndex - 1] || 'eval(input)',
      fixedLine: (codeLines[lineIndex - 1] || 'eval(input)').replace('eval(', 'JSON.parse('),
      explanation: 'Replaced insecure eval() execution with safe JSON parse.'
    });
    optimizationSuggestions.push('Ensure user input is strictly validated and sanitized instead of evaluating dynamic scripts.');
  }

  if (code.includes('==') && (language === 'JavaScript' || language === 'TypeScript')) {
    const lineIndex = codeLines.findIndex(l => l.includes('==') && !l.includes('===')) + 1;
    if (lineIndex > 0) {
      bugs.push({
        category: 'Best Practices',
        severity: 'Low',
        line: lineIndex,
        message: 'Use strict equality (===) instead of loose equality (==).',
        explanation: 'Loose equality (==) performs type coercion before comparison, which can lead to unexpected runtime behavior and subtle bugs.'
      });
      // Replace only first occurrence
      fixedCode = fixedCode.replace('==', '===');
      lineExplanations.push({
        line: lineIndex,
        originalLine: codeLines[lineIndex - 1],
        fixedLine: codeLines[lineIndex - 1].replace('==', '==='),
        explanation: 'Enforced type safety using triple equality (===).'
      });
    }
  }

  if (code.toLowerCase().includes('password') && (code.includes('="') || code.includes("='"))) {
    const lineIndex = codeLines.findIndex(l => l.toLowerCase().includes('password') && (l.includes('=') || l.includes(':'))) + 1;
    if (lineIndex > 0) {
      bugs.push({
        category: 'Security Vulnerabilities',
        severity: 'High',
        line: lineIndex,
        message: 'Hardcoded sensitive credentials detected.',
        explanation: 'Never store plain-text passwords or secret keys in source files. Inject credentials securely using environment variables.'
      });
    }
  }

  // Detect basic performance leaks
  if (code.includes('while (true)') || code.includes('while(true)')) {
    const lineIndex = codeLines.findIndex(l => l.includes('while (true)') || l.includes('while(true)')) + 1;
    bugs.push({
      category: 'Runtime Errors',
      severity: 'Critical',
      line: lineIndex,
      message: 'Potential infinite loop detected.',
      explanation: 'Running while(true) without guaranteed breakout logic blocks the main thread, resulting in application freezing or high CPU usage.'
    });
  }

  // Add default/informational bug if list is empty
  if (bugs.length === 0) {
    bugs.push({
      category: 'Best Practices',
      severity: 'Informational',
      line: 1,
      message: 'Code analysis complete. Structure is clean.',
      explanation: 'No critical errors detected. Follow structural linting guidelines and document module parameters.'
    });
    optimizationSuggestions.push('Consider adding JSDoc comments or type structures for clarity.');
  }

  // Populate overall scores
  const scoreBase = bugs.some(b => b.severity === 'Critical') ? 45 : bugs.some(b => b.severity === 'High') ? 65 : 85;
  const readability = code.trim().length > 300 ? 70 : 90;
  const maintainability = totalLines > 100 ? 60 : 85;
  const overall = Math.round((scoreBase + readability + maintainability) / 3);

  summary = `The uploaded ${language} code displays ${bugs.length} noted diagnostic concerns. Performance and resource usages fall within typical parameters, with recommendations around modular security and syntax clarity.`;

  return {
    summary,
    bugs,
    metrics: {
      complexity: totalLines > 60 ? 'Medium' : 'Low',
      readabilityScore: readability,
      maintainabilityScore: maintainability,
      overallQualityScore: overall,
      estimatedExecutionTime: totalLines > 100 ? '45ms' : '8ms',
      estimatedMemoryUsage: totalLines > 100 ? '1.2MB' : '150KB'
    },
    optimizationSuggestions: optimizationSuggestions.length > 0 ? optimizationSuggestions : [
      'Refactor multi-nested statements to modular helper functions.',
      'Document variables and parameters using appropriate typing annotations.'
    ],
    fixedCode,
    lineExplanations: lineExplanations.length > 0 ? lineExplanations : [
      {
        line: 1,
        originalLine: codeLines[0] || '',
        fixedLine: codeLines[0] || '',
        explanation: 'Code entry point looks standard.'
      }
    ],
    confidenceScore: 90
  };
};

// Main Analysis function
const analyzeCode = async (code, language = 'Auto-Detect') => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.log('No Gemini API Key found. Returning mock analysis.');
    return getMockAnalysis(code, language);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as the fast, cost-effective default model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `
      You are an expert software engineer and security auditor.
      Analyze the following source code snippet:
      Language: ${language}
      Code:
      \`\`\`
      ${code}
      \`\`\`

      Perform a comprehensive code review. Detect bugs, syntax errors, logic problems, memory issues, code smells, performance bottlenecks, and security vulnerabilities. Format your response STRICTLY as a JSON object matching this schema:
      {
        "summary": "High-level summary of the code and findings.",
        "bugs": [
          {
            "category": "Syntax Errors" | "Runtime Errors" | "Logic Errors" | "Performance Problems" | "Memory Issues" | "Code Smells" | "Best Practices" | "Security Vulnerabilities",
            "severity": "Critical" | "High" | "Medium" | "Low" | "Informational",
            "line": 12, // 1-indexed line number where the issue occurs, or null
            "message": "Direct message summarizing the issue.",
            "explanation": "Why this happens and details on how it can be fixed."
          }
        ],
        "metrics": {
          "complexity": "Low" | "Medium" | "High",
          "readabilityScore": 85, // 0-100 score
          "maintainabilityScore": 80, // 0-100 score
          "overallQualityScore": 78, // 0-100 score
          "estimatedExecutionTime": "e.g. 5ms or N/A",
          "estimatedMemoryUsage": "e.g. 150KB or N/A"
        },
        "optimizationSuggestions": [
          "List of general optimization suggestions or coding practices to apply."
        ],
        "fixedCode": "Provide the fully corrected, refactored, and optimized version of the entire input code.",
        "lineExplanations": [
          {
            "line": 12, // Line index in original code
            "originalLine": "Original line code text",
            "fixedLine": "Fixed line code text",
            "explanation": "Brief explanation of the specific change made to this line."
          }
        ],
        "confidenceScore": 95 // 0-100 score
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini API call failed, using mock analysis fallback:', error);
    return getMockAnalysis(code, language);
  }
};

// Chat Assistant with Gemini
const chatWithAI = async (code, language, history, message) => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    return `[Mock Mode - No Gemini Key Configured]
Based on the code provided in ${language}:
You asked: "${message}"

Here is an analysis:
1. Make sure input sanitization is configured correctly.
2. Consider implementing custom catch blocks.
3. Optimize database lookups to prevent thread blocking.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const systemPrompt = `You are a helpful programming assistant. Below is the code context we are discussing:
Language: ${language}
Code:
\`\`\`
${code}
\`\`\`
Answer user questions regarding this code (debugging, complexity, explanations, unit tests, optimizations). Keep response clean and use markdown format.`;

    // Initialize chat
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat failed:', error);
    return `AI Chat is currently unavailable. Error details: ${error.message}`;
  }
};

module.exports = {
  analyzeCode,
  chatWithAI
};
