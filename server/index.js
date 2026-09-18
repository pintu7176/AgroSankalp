import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrosankalp')
  .then(() => console.log('✅ MongoDB Connected Logically'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple logic: if user exists, "log them in". If not, "create" them.
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password });
      await user.save();
      return res.status(201).json({ message: 'New account created successfully!', user });
    }
    
    // We are trusting the password for testing purposes since this is a basic implementation
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    res.status(200).json({ message: 'Welcome back! You have successfully logged in.', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { category, content } = req.body;
    const newPost = new Post({ category, content });
    await newPost.save();
    res.status(201).json({ message: 'Your post has been successfully published to the community!', post: newPost });
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating post' });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
});

app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes += 1;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error while liking post' });
  }
});

app.put('/api/posts/:id/answer', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const { authorName, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Reply content is required' });

    post.replies.push({
      authorName: authorName || 'Anonymous Farmer',
      content
    });
    
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error while answering post' });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
