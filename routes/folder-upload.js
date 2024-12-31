const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const Joi = require('joi');

const router = express.Router();

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
    },
    fileFilter:(req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, MP4, MP3, and WAV are allowed.'));
        }
        cb(null, true);
    },
});

const upload = multer({ storage });
const uploadSchema = Joi.object({
    title: Joi.string().min(3).max(30).required().messages({
        'string.base': 'Title should be a string',
        'string.empty': 'Title cannot be empty',
        'string.min': 'Title should have a minimum length of 3',
        'string.max': 'Title should have a maximum length of 30',
        'any.required': 'Title is required',
    }),
    description: Joi.string().min(10).max(50).required().messages({
        'string.base': 'Description should be a string',
        'string.empty': 'Description cannot be empty',
        'string.min': 'Description should have a minimum length of 10',
        'string.max': 'Description should have a maximum length of 50',
        'any.required': 'Description is required',
    }),
    fileType: Joi.string().valid('image', 'video', 'audio').required().messages({
        'string.base': 'File type should be a string',
        'any.required': 'File type is required',
        'any.only': 'File type must be one of: image, video, audio',
    }),
    userId: Joi.number().required().messages({
        'number.base': 'User ID must be a number',
        'any.required': 'User ID is required',
    }),
});
router.post('/upload', upload.single('file'), async (req, res) => {
    const { title, description, fileType, userId } = req.body;

    const { error } = uploadSchema.validate({ title, description ,fileType , userId});
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
    }
    const filePath = `/uploads/${req.file.filename}`;

    try {
        await db.execute(
            'INSERT INTO media_files2 (user_id, title, description, file_type, file_path) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, fileType, filePath]
        );
        res.status(201).json({ message: 'File uploaded successfully', filePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
