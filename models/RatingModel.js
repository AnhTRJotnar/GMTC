const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'bookings', required: true }, // Ensure 'bookingId' is the correct field name
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    ratings: { type: Number, required: true },
    comments: { type: String },
});
const ratingModel = mongoose.model('ratings', ratingSchema);
module.exports = ratingModel;
