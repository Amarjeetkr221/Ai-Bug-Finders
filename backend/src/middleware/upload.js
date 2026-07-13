const multer = require('multer');
const path = require('path');

// Configure disk storage for files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp' || './uploads'); // standard temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter check (only allow source code or images for avatar)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.java', '.py', '.c', '.cpp', '.h', '.js', '.jsx', '.ts', '.tsx',
    '.php', '.go', '.rs', '.swift', '.kt', '.sql', '.html', '.css',
    '.png', '.jpg', '.jpeg', '.txt'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('File extension is not supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB maximum
  }
});

module.exports = upload;
