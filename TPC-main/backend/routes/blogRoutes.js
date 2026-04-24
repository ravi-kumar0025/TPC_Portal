const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Get events the logged in student is eligible to write about
router.get('/eligible', verifyToken, requireRole(['student']), blogController.getEligibleEvents);

// Fetch all published blogs (requires login as per user request)
router.get('/', verifyToken, blogController.getAllBlogs);

// Fetch specific blog details
router.get('/:id', verifyToken, blogController.getBlogById);

// Submit a new blog
router.post('/', verifyToken, requireRole(['student']), blogController.createBlog);

module.exports = router;
