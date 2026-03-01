const Student = require('../models/Student');

exports.getStudents = async (req, res) => {
    try {
        const { cgpa, branch, program } = req.query;

        // Construct dynamic MongoDB query
        const query = {};

        if (cgpa) {
            query.cgpa = { $gte: parseFloat(cgpa) };
        }

        if (branch) {
            // Expecting a comma-separated list of branches
            const branchArray = branch.split(',').map(b => b.trim());
            if (branchArray.length > 0) {
                query.branch = { $in: branchArray };
            }
        }

        if (program) {
            // Expecting a comma-separated list of programs
            const programArray = program.split(',').map(p => p.trim());
            if (programArray.length > 0) {
                query.program = { $in: programArray };
            }
        }

        const students = await Student.find(query).select('-__v');
        res.status(200).json({ students });
    } catch (err) {
        console.error('getStudents Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
