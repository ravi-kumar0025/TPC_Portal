const mongoose = require('mongoose');
const User = require('./User');

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    companyEmail: {
        type: String,
        required: true,
        unique: true,
    },
    companyWebsite: {
        type: String,
        required: true,
    },
    HRContactName: {
        type: String,
        required: true,
    },
    HRContactEmail: {
        type: String,
        required: true,
    },
    companyVerified: {
        type: Boolean,
        default: false,
    },
    verificationDeadline: {
        type: Date,
        default: () => Date.now() + 48 * 60 * 60 * 1000,
    }
});

// Implement MongoDB TTL index 
// The index only applies if companyVerified is false, automatically purging unverified accounts after deadline.
companySchema.index(
    { verificationDeadline: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: { companyVerified: false }
    }
);

const Company = User.discriminator('company', companySchema);

module.exports = Company;
