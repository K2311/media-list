const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Joi = require('joi');


const router = express.Router();

const registerSchema = Joi.object({
    username: Joi.string().min(2).max(20).required().messages({
        'string.base': 'Username should be a string',
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username should have a minimum length of 2',
        'string.max': 'Username should have a maximum length of 20',
        'any.required': 'Username is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Password should be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password should have a minimum length of 6',
        'any.required': 'Password is required',
    }),
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const { error } = registerSchema.validate({ username, password });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {

        const [existingUser] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: 'User registered', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
});

const loginSchema = Joi.object({
    username: Joi.string().min(2).max(20).required().messages({
        'string.base': 'Username should be a string',
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username should have a minimum length of 2',
        'string.max': 'Username should have a maximum length of 20',
        'any.required': 'Username is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.base': 'Password should be a string',
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password should have a minimum length of 6',
        'any.required': 'Password is required',
    }),
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const { error } = registerSchema.validate({ username, password });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
