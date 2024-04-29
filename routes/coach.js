var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var UserModel = require('../models/UserModel');
var ClassModel = require('../models/ClassModel');
var BookingModel = require('../models/BookingModel');
var RatingModel = require('../models/RatingModel');
var { checkLoginSession, checkAdminSession, checkCoachSession, checkStudentSession } = require('../middlewares/auth');
var bcrypt = require('bcryptjs');
var { hash } = require('bcrypt');
var salt = 8; 

//GET coach listing 
router.get('/coaches', checkStudentSession, checkLoginSession, async (req, res) => {
    try {
        // Find all coaches
        const coaches = await UserModel.find({ role: 'coach' });
        
        // Iterate through each coach to calculate average rating
        for (const coach of coaches) {
            // Find bookings for this coach with status 'rated'
            const bookings = await BookingModel.find({ coachId: coach._id, status: 'rated' });
            
            // Extract ratings from bookings
            const ratings = bookings.map(booking => booking.rating);
            
            // Calculate average rating
            const averageRating = calculateAverage(ratings);
            
            // Assign average rating to coach object
            coach.averageRating = averageRating;
        }
        
        // Render the coach index page with CoachList and average ratings
        res.render('coach/index', { CoachList: coaches });
    } catch (error) {
        console.error("Error retrieving coaches: ", error);
        res.status(500).send("Error retrieving coaches: " + error.message);
    }
});

// Function to calculate the average of an array
function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, curr) => acc + curr, 0);
    return sum / arr.length;
}



// Fetch all bookings for the logged-in coach
router.get('/bookingList', checkCoachSession, checkLoginSession, async (req, res) => {
    try {
        const loggedInCoachId = req.session.userId;

        // Get all bookings for this coach with their rating
        const bookings = await BookingModel.find({
            coachId: loggedInCoachId,
        }).populate('studentId', 'username'); // Populate with student details

        res.render('coach/bookingRequest', { bookings }); // Pass the bookings to the view
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        res.status(500).send("Error retrieving bookings: " + error.message);
    }
});

// Accept booking
router.post('/accept-booking/:id', checkCoachSession, checkLoginSession, async (req, res) => {
    try {
        var bookingId = req.params.id;
        await BookingModel.findByIdAndUpdate(bookingId, { status: 'accepted' });
        res.redirect('/coach/bookingList'); // Redirect to the coach's dashboard or another appropriate page
    } catch (error) {
        res.status(500).send('Error accepting booking: ' + error.message);
    }
});

//Reject booking
router.post('/reject-booking/:id', checkCoachSession, checkLoginSession, async (req, res) => {
    try {
        var bookingId = req.params.id;
        var updatedBooking = await BookingModel.findByIdAndUpdate(
            bookingId, 
            { status: 'rejected' },
            { new: true } // Returns the updated document
        );

        if (!updatedBooking) {
            return res.status(404).send('Booking not found');
        }
        await BookingModel.findByIdAndDelete(bookingId);
        // Redirect or send a success message
        res.redirect('/coach/bookingList');
    } catch (error) {
        console.error("Error rejecting booking:", error);
        res.status(500).send("Error processing your request");
    }
});

//View schedule
router.get('/bookingSchedule', checkLoginSession,(req, res) => {
    res.render('coach/schedule');
});

//Send appointments to callendar
router.get('/bookingData', checkLoginSession, async (req, res) => {
    try {
        var currentUserId = req.session.userId;
        // Fetch bookings where the current user is either the student or the coach
        var bookings = await BookingModel.find({ 
            status: 'accepted',
            $or: [{ studentId: currentUserId }, { coachId: currentUserId }]
        });
        
        var events = bookings.map(booking => ({
            title: booking.title,
            start: booking.start,
            end: booking.end
        }));

        res.json(events);
    } catch (error) {
        console.error("Error fetching booking data:", error);
        res.status(500).send("Error fetching booking data: " + error.message);
    }
});

router.get('/ratings', checkCoachSession, async (req, res) => {
    try {
        const coachId = req.session.userid; // Assuming session contains the coach ID
        const ratings = await RatingModel.find({ coachId })
            .populate('studentId', 'username')
            .populate('bookingId', 'start end');

        res.render('coach/bookingRequest', { ratings });
    } catch (error) {
        console.error("Error retrieving coach ratings:", error);
        res.status(500).send("Error retrieving coach ratings.");
    }
});


module.exports = router;
