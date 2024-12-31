const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const Joi = require('joi');
const router = express.Router();

// Define allowed MIME types
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const videoMimeTypes = ['video/mp4'];
const audioMimeTypes = ['audio/mpeg', 'audio/wav'];

// Define file storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// function checkFileType(file, cb) {
//     // Check the file type using file-type library
//     const buffer = file.buffer.slice(0, 4);  // Get the first few bytes for checking
//     fileType.fromBuffer(buffer).then((type) => {
//         if (type && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type.mime)) {
//             return cb(null, true);
//         } else {
//             return cb(new Error('Error: Invalid file type. Allowed types: jpeg, jpg, png, gif, webp.'));
//         }
//     }).catch((err) => {
//         return cb(new Error('Error: Could not determine file type.'));
//     });
// }
function checkFileType(file, cb) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type. Allowed types: jpeg, jpg, png, gif, webp.'));
}
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});




// Joi validation schema
const uploadSchema = Joi.object({
    title: Joi.string().min(3).max(30).required().messages({
        'string.base': 'Title should be a string.',
        'string.empty': 'Title cannot be empty.',
        'string.min': 'Title must have a minimum length of 3 characters.',
        'string.max': 'Title must have a maximum length of 30 characters.',
        'any.required': 'Title is required.',
    }),
    description: Joi.string().min(10).max(50).required().messages({
        'string.base': 'Description should be a string.',
        'string.empty': 'Description cannot be empty.',
        'string.min': 'Description must have a minimum length of 10 characters.',
        'string.max': 'Description must have a maximum length of 50 characters.',
        'any.required': 'Description is required.',
    }),
    fileType: Joi.string().valid('image', 'video', 'audio').required().messages({
        'string.base': 'File type should be a string.',
        'any.required': 'File type is required.',
        'any.only': 'File type must be one of: image, video, audio.',
    }),
    userId: Joi.number().required().messages({
        'number.base': 'User ID must be a number.',
        'any.required': 'User ID is required.',
    }),
});

// POST route for file upload
router.post('/upload', async (req, res) => {
    
    upload.single('file')(req, res, async (err) => {
        if (err) {
            // Handle Multer errors (e.g., invalid file type)
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: err.message });
            }
            // Handle custom errors
            return res.status(400).json({ error: err.message });
        }

        const { title, description, fileType, userId } = req.body;
        // Validate request body with Joi schema
        const { error } = uploadSchema.validate({ title, description, fileType, userId });
        if (error) {
            return res.status(400).json({
                status: 'error',
                message: error.details[0].message, // Return the first error message
                field: error.details[0].context.key, // Return the field that failed validation
            });
        }

    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'File is required.',
        });
    }

    const filePath = `/uploads/${req.file.filename}`;

    try {
        // Insert file data into the database
        await db.execute(
            'INSERT INTO media_files2 (user_id, title, description, file_type, file_path) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, fileType, filePath]
        );
        res.status(201).json({
            status: 'success',
            message: 'File uploaded successfully.',
            filePath: filePath,
        });
    } catch (error) {
        console.error(error);  // Log error for debugging
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error. Please try again later.',
            error: error.message,  // Optional: Include error message for debugging
        });
    }
    });
    
});

module.exports = router;
