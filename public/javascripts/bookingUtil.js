const BookingModel = require('../../models/BookingModel');

async function markCompletedSessions() {
    try {
        const now = new Date();

        // Find bookings where the end time is in the past and the status isn't 'complete'
        const sessionsToUpdate = await BookingModel.find({
            end: { $lt: now },
            status: { $nin: ['complete', 'rated'] } // Exclude sessions marked as 'complete' or 'rated'
        });

        // Update the status of those bookings to 'complete'
        const result = await BookingModel.updateMany(
            { _id: { $in: sessionsToUpdate.map(s => s._id) } },
            { $set: { status: 'complete' } }
        );

        console.log(`${result.nModified} sessions marked as complete.`);
    } catch (error) {
        console.error("Error updating sessions to complete:", error);
    }
}

module.exports = { markCompletedSessions };
