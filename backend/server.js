const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Ensure this path is correct
const authMiddleware = require('./middleware/authMiddleware'); 
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/response-codes', {
  
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema and Model
const ListSchema = new mongoose.Schema({
  name: String,
  creationDate: { type: Date, default: Date.now },
  responseCodes: [Number],
  imageLinks: [String],
});

const List = mongoose.model('List', ListSchema);

// List Routes
app.post('/lists', async (req, res) => {
  try {
    const { name, responseCodes, imageLinks } = req.body;
    const list = new List({ name, responseCodes, imageLinks });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/lists', async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/lists/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/lists/:id', async (req, res) => {
  try {
    const list = await List.findByIdAndDelete(req.params.id);
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/lists/:id', async (req, res) => {
  try {
    const { name, responseCodes, imageLinks } = req.body;
    const list = await List.findByIdAndUpdate(
      req.params.id,
      { name, responseCodes, imageLinks },
      { new: true }
    );
    if (!list) return res.status(404).json({ error: 'List not found' });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/protected-route', authMiddleware, (req, res) => {
  // Handle request here
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
