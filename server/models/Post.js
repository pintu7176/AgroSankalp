import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    default: 'Anonymous Farmer'
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: [{
    authorName: {
      type: String,
      default: 'Anonymous Farmer'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
