const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const calendarController = require('../controllers/calendarController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/events', verifyToken, requireRole(['student', 'admin']), studentController.getEvents);
router.get('/announcements', verifyToken, requireRole(['student', 'admin']), studentController.getAnnouncements);
router.get('/calendar', verifyToken, requireRole(['student', 'admin']), calendarController.getUnifiedCalendar);
    
module.exports = router;
