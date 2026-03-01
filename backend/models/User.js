const mongoose = require('mongoose');

const baseOptions = {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true,
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['admin', 'company', 'student'],
        required: true,
    },
    profilePicture: {
        type: String,
        default: '',
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
}, baseOptions);

const User = mongoose.model('User', userSchema);

module.exports = User;
