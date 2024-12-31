const express = require('express');
const multer = require('multer');
const db = require('../config/db');


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
    const { title, description, fileType, userId } = req.body;
    const file = req.file?.buffer;

    if (!file) {
        return res.status(400).json({ message: 'File is required' });
    }

    try {
        await db.execute(
            'INSERT INTO media_files (user_id, title, description, file_type, file) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description, fileType, file]
        );
        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;