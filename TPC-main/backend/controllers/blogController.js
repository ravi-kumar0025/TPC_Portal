const Blog = require('../models/Blog');
const Application = require('../models/Application');
const Event = require('../models/Event');
const User = require('../models/User');

/**
 * GET /api/blogs/eligible
 * Get list of events the logged in student is eligible to write a blog for.
 */
exports.getEligibleEvents = async (req, res) => {
    try {
        const studentId = req.user.userId;

        // 1. Find all applications where status is accepted or rejected
        const applications = await Application.find({
            studentId,
            status: { $in: ['accepted', 'rejected'] }
        }).lean();

        if (applications.length === 0) {
            return res.status(200).json({ eligibleEvents: [] });
        }

        const eventIds = applications.map(app => app.eventId);

        // 2. Find if the student has already written a blog for any of these
        const writtenBlogs = await Blog.find({
            studentId,
            eventId: { $in: eventIds }
        }).select('eventId').lean();

        const writtenEventIds = new Set(writtenBlogs.map(b => b.eventId.toString()));

        // 3. Filter applications to only those without a written blog
        const eligibleApplications = applications.filter(
            app => !writtenEventIds.has(app.eventId.toString())
        );

        if (eligibleApplications.length === 0) {
            return res.status(200).json({ eligibleEvents: [] });
        }

        // 4. Populate event details to send to frontend
        const eligibleEventIds = eligibleApplications.map(app => app.eventId);
        const events = await Event.find({ _id: { $in: eligibleEventIds } })
            .select('title rounds type')
            .lean();

        const eventMap = {};
        events.forEach(e => { eventMap[e._id.toString()] = e; });

        // Attach round index so frontend knows how many segments to render
        const results = eligibleApplications.map(app => {
            const event = eventMap[app.eventId.toString()];
            return {
                applicationId: app._id,
                event: event,
                currentRoundIndex: app.currentRoundIndex,
                status: app.status
            };
        }).filter(r => r.event); // Only keep if event still exists

        res.status(200).json({ eligibleEvents: results });
    } catch (err) {
        console.error('getEligibleEvents error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/blogs
 * Create a new interview experience blog
 */
exports.createBlog = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { eventId, generalAdvice, segments, isAnonymous } = req.body;

        if (!eventId || !generalAdvice || !segments || !Array.isArray(segments)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check eligibility
        const application = await Application.findOne({
            studentId,
            eventId,
            status: { $in: ['accepted', 'rejected'] }
        });

        if (!application) {
            return res.status(403).json({ message: 'You are not eligible to write a blog for this event' });
        }

        // Check if already written
        const existingBlog = await Blog.findOne({ studentId, eventId });
        if (existingBlog) {
            return res.status(400).json({ message: 'You have already shared your experience for this event' });
        }

        const newBlog = await Blog.create({
            studentId,
            eventId,
            generalAdvice,
            segments,
            isAnonymous: Boolean(isAnonymous),
            isPublished: true // Auto-publish as per requirement
        });

        res.status(201).json({
            message: 'Interview experience published successfully!',
            blog: newBlog
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already shared your experience for this event' });
        }
        console.error('createBlog error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/blogs
 * Fetch all published blogs for displaying in the feed
 */
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .populate({
                path: 'studentId',
                select: 'fullName department program currentYearOfStudy profilePicture'
            })
            .populate({
                path: 'eventId',
                select: 'title type'
            })
            .lean();

        // Handle anonymity
        const formattedBlogs = blogs.map(blog => {
            if (blog.isAnonymous) {
                blog.studentId = {
                    _id: 'anonymous',
                    fullName: 'Anonymous Student',
                    department: blog.studentId?.department || 'Unknown',
                    program: blog.studentId?.program || 'Unknown',
                    profilePicture: null
                };
            }
            return blog;
        });

        res.status(200).json({ blogs: formattedBlogs });
    } catch (err) {
        console.error('getAllBlogs error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/blogs/:id
 * Fetch a specific blog by ID
 */
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate({
                path: 'studentId',
                select: 'fullName department program currentYearOfStudy profilePicture'
            })
            .populate({
                path: 'eventId',
                select: 'title type'
            })
            .lean();

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.isAnonymous) {
            blog.studentId = {
                _id: 'anonymous',
                fullName: 'Anonymous Student',
                department: blog.studentId?.department || 'Unknown',
                program: blog.studentId?.program || 'Unknown',
                profilePicture: null
            };
        }

        res.status(200).json({ blog });
    } catch (err) {
        console.error('getBlogById error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
