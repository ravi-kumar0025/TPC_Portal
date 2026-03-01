const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const { type, targetBranch } = req.query;

        const query = {};
        if (type) query.type = type;
        if (targetBranch) query.targetBranches = targetBranch; // Matches if targetBranch is in the array

        const events = await Event.find(query).sort({ date: 1 });
        res.status(200).json({ events });
    } catch (err) {
        console.error('getEvents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const { branch, batch } = req.query;
        // Announcements could be Events of type 'workshop' or special schema. 
        // We will use Event with specific targetBranches.
        const query = {};
        if (branch) {
            query.targetBranches = { $in: [branch, 'All'] };
        }

        // For simplicity, we just return events sorted by createdAt for announcements
        const announcements = await Event.find(query).sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ announcements });
    } catch (err) {
        console.error('getAnnouncements Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
