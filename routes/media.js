const express = require('express');
const db = require('../config/db');

const router = express.Router();
router.get('/list', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const parsedLimit = parseInt(limit, 10); // Convert limit to integer
        const parsedOffset = (parseInt(page, 10) - 1) * parsedLimit; // Calculate offset

        if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
            return res.status(400).json({ error: 'Invalid page or limit values' });
        }
        const [files] = await db.query(
            `SELECT * FROM media_files LIMIT ${parsedLimit} OFFSET ${parsedOffset}`
        );

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/folder-list', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const parsedLimit = parseInt(limit, 10); 
        const parsedOffset = (parseInt(page, 10) - 1) * parsedLimit; 

        if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
            return res.status(400).json({ error: 'Invalid page or limit values' });
        }
        const [files] = await db.query(
            `SELECT * FROM media_files2 LIMIT ${parsedLimit} OFFSET ${parsedOffset}`
        );

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;