const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDirectory = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Set storage options for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);  // Store the file in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique filename
        cb(null, uniqueSuffix + path.extname(file.originalname));  // Add file extension to filename
    }
});

// Filter to only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG, PNG, and GIF are allowed'), false);
    }
};

// Create upload middleware for handling image uploads
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB
    fileFilter: fileFilter
});

module.exports = upload;
