const Student = require('../models/Student');
const Company = require('../models/Company');

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

exports.submitVerification = async (req, res) => {
    try {
        const companyId = req.user.userId;
        const { companyName, companyEmail, companyWebsite, HRContactName, HRContactEmail, contactNumber } = req.body;

        const updateData = {
            verificationStatus: 'pending'
        };

        if (companyName) updateData.companyName = companyName;
        if (companyEmail) updateData.companyEmail = companyEmail;
        if (companyWebsite) updateData.companyWebsite = companyWebsite;
        if (HRContactName) updateData.HRContactName = HRContactName;
        if (HRContactEmail) updateData.HRContactEmail = HRContactEmail;
        if (contactNumber) updateData.contactNumber = contactNumber;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updateData,
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found.' });
        }

        res.status(200).json({
            message: 'Company verification submitted successfully.',
            company: updatedCompany
        });

    } catch (err) {
        console.error('submitVerification Error:', err);
        res.status(500).json({ message: 'Internal server error during company verification submission.' });
    }
};
