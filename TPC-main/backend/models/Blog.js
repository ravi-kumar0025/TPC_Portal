const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    roundTitle: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
});

const blogSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    generalAdvice: {
        type: String,
        required: true,
    },
    segments: [segmentSchema],
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

// Ensure a student can only write one blog per event
blogSchema.index({ eventId: 1, studentId: 1 }, { unique: true });
// Fast lookup for finding recent published blogs
blogSchema.index({ isPublished: 1, createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
