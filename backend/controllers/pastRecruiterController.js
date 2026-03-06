const PastRecruiter = require('../models/PastRecruiter');

// @desc    Get all past recruiters
// @route   GET /api/past-recruiters
// @access  Public
exports.getPastRecruiters = async (req, res) => {
    try {
        const recruiters = await PastRecruiter.find().sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: recruiters.length,
            data: recruiters
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new past recruiter
// @route   POST /api/past-recruiters
// @access  Private (Admin only)
exports.createPastRecruiter = async (req, res) => {
    try {
        const recruiter = await PastRecruiter.create(req.body);
        res.status(201).json({
            success: true,
            data: recruiter
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update past recruiter
// @route   PUT /api/past-recruiters/:id
// @access  Private (Admin only)
exports.updatePastRecruiter = async (req, res) => {
    try {
        const recruiter = await PastRecruiter.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete past recruiter
// @route   DELETE /api/past-recruiters/:id
// @access  Private (Admin only)
exports.deletePastRecruiter = async (req, res) => {
    try {
        const recruiter = await PastRecruiter.findByIdAndDelete(req.params.id);

        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Recruiter not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
