const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure this path is correct

// Signup Route
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (username.length < 6 || password.length < 6) {
    return res.status(400).send('Username and password must be at least 6 characters long.');
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).send('Server error');
  }
});



// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password');

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Invalid username or password');

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
