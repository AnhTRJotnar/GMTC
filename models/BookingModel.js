var mongoose = require('mongoose');
var BookingSchema = new mongoose.Schema({
    coachId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
    },
    description: {
        type: String, 
        default: 'No description provided' 
    },
    start: { 
        type: Date, 
        required: true 
    },
    end: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'complete', 'rated'], 
        default: 'pending' 
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
}, 
{ timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
