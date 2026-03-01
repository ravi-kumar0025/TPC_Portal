const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/events', verifyToken, requireRole(['student', 'admin']), studentController.getEvents);
router.get('/announcements', verifyToken, requireRole(['student', 'admin']), studentController.getAnnouncements);

module.exports = router;
