const Event = require('../models/Event');
const Announcement = require('../models/Announcement');

exports.getUnifiedCalendar = async (req, res) => {
    try {
        // Fetch all events and all announcements — no branch filtering here,
        // because announcements with empty targetBranches mean "all branches".
        const [events, rawAnnouncements] = await Promise.all([
            Event.find({}).populate('createdBy', 'fullName email'),
            Announcement.find({}).populate('createdBy', 'fullName email')
        ]);

        // Sort announcements by effective date = max(editedAt, createdAt)
        const announcements = rawAnnouncements.sort((a, b) => {
            const aDate = Math.max(a.editedAt?.getTime() ?? 0, a.createdAt?.getTime() ?? 0);
            const bDate = Math.max(b.editedAt?.getTime() ?? 0, b.createdAt?.getTime() ?? 0);
            return bDate - aDate;
        });

        const calendarItems = [];

        events.forEach(event => {
            const eventObj = event.toObject();
            calendarItems.push({
                id: eventObj._id,
                title: event.title,
                start: event.startDate ? new Date(event.startDate).toISOString() : (event.date ? new Date(event.date).toISOString() : null),
                end: event.endDate ? new Date(event.endDate).toISOString() : (event.startDate ? new Date(event.startDate).toISOString() : null),
                type: event.type,
                appliedStudents: event.appliedStudents || [],
                extendedProps: {
                    ...eventObj,
                    links: event.links || [],
                }
            });
        });

        announcements.forEach(ann => {
            // Use editedAt as the calendar date if the announcement was edited
            // so it floats up to the edit date on the student calendar
            const displayDate = ann.isEdited && ann.editedAt
                ? new Date(ann.editedAt).toISOString()
                : (ann.createdAt ? new Date(ann.createdAt).toISOString() : null);

            calendarItems.push({
                id: ann._id,
                title: ann.isEdited ? `✎ ${ann.title}` : ann.title,
                start: displayDate,
                end: displayDate,
                type: 'announcement',
                appliedStudents: [],
                extendedProps: {
                    ...ann.toObject(),
                    // Expose edit metadata explicitly so the detail pane can read them
                    isEdited: ann.isEdited,
                    editedAt: ann.editedAt,
                }
            });
        });

        res.status(200).json({ calendar: calendarItems });
    } catch (err) {
        console.error('getUnifiedCalendar Error:', err);
        res.status(500).json({ message: 'Internal server error while fetching unified calendar' });
    }
};

