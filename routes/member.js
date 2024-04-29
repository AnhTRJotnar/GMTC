var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UserModel = require('../models/UserModel');
var ClassModel = require('../models/ClassModel');
var BookingModel = require('../models/BookingModel');
var RatingModel = require('../models/RatingModel');
const { check, validationResult } = require('express-validator');

var { checkLoginSession, checkAdminSession, checkStudentSession } = require('../middlewares/auth');

var bcrypt = require('bcryptjs');
var { hash } = require('bcrypt');
var salt = 8; 
var multer = require('multer');

var prefix = Math.floor(Math.random() * 100000000) + 1;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        let fileName = prefix + "_" + file.originalname;
        cb(null, fileName);
    }
})
const upload = multer({storage: storage}) 

const usernameValidation = [
    check('username')
        .isAlphanumeric().withMessage('Username must contain only alphanumeric characters.')
        .custom(async (value) => {
            const user = await UserModel.findOne({ username: value });
            if (user) {
                throw new Error('Username already exists. Please choose a different one.');
            }
        }),
    check('password', 'Password is required').notEmpty(),
    check('role', 'Role is required').notEmpty(),
];

// GET Members listing
router.get('/', checkLoginSession, checkAdminSession, async (req, res) => {
    var UserList = await UserModel.find({}).populate('classes');
    res.render('member', { UserList });
});

//add members
router.get('/add', checkAdminSession, checkLoginSession, async (req, res) => {
    res.render('auth/register');
})

router.post('/add', checkAdminSession, upload.single('image'), usernameValidation, async (req, res) => {
    try {
        const userRegistration = req.body;
        // Collect validation errors
        const errors = validationResult(req);
        const errorMessages = errors.array().map((err) => err.msg);
        if (errorMessages.length > 0) {
            // Return the registration form with validation errors
            return res.status(400).render('auth/register', { errors: errorMessages, userRegistration });
        }
        // Check for existing username
        const existingUser = await UserModel.findOne({ username: userRegistration.username });
        if (existingUser) {
            errorMessages.push('Username already exists. Please choose a different one.');
            return res.render('auth/register', { errors: errorMessages, userRegistration });
        }
        // Create a new user
        const hashedPassword = bcrypt.hashSync(userRegistration.password, salt);
        const newUser = {
            username: userRegistration.username,
            password: hashedPassword,
            role: userRegistration.role,
            image: req.file.filename,
        };
        await UserModel.create(newUser);
        // Redirect upon successful registration
        return res.redirect('/member');
    } catch (error) {
        console.error('User creation error:', error);
        // Return a generic error message along with existing validation errors
        errorMessages.push('An error occurred while creating the user. Please try again.');
        return res.render('auth/register', { errors: errorMessages, userRegistration });
    }
});

//edit member's details
router.get('/edit/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    try {
        var id = req.params.id;
        var user = await UserModel.findById(id);
        var role = await UserModel.distinct('role')
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('member/edit', { user, role });
    } catch (error) {
        res.status(500).send('Error retrieving user: ' + error.message);
    }
});

router.post('/edit/:id', checkAdminSession, checkLoginSession, upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        const { username, role, newPassword } = req.body;
        const updateData = { username, role };
        if (newPassword && newPassword.trim()) {
            updateData.password = bcrypt.hashSync(newPassword, salt);
        }
        if (req.file) {
            updateData.image = req.file.filename;
        }
        await UserModel.findByIdAndUpdate(id, updateData);
        res.redirect('/member');
    } catch (error) {
        res.status(500).send('Error updating user: ' + error.message);
    }
});

// GET request to delete a User
router.get('/delete/:id', checkLoginSession, checkAdminSession, async (req, res) => {
    try {
        await UserModel.findByIdAndDelete(req.params.id);
        res.redirect('/member');
    } catch (error) {
        res.status(500).send('Error while deleting User: ' + error.message);
    }
});

// Add members to classes
router.get('/addToClass/:id', checkAdminSession, checkLoginSession, async (req, res) => {
    var user = await UserModel.findById(req.params.id);
    var classes = await ClassModel.find({});
    res.render('member/addToClass', { user, classes });
});

router.post('/addToClass/:memberId', checkAdminSession, checkLoginSession, async (req, res) => {
    var { memberId } = req.params;
    var { classId } = req.body;
    try {
        // Find the user and the class from the database
        var user = await UserModel.findById(memberId);
        var classObj = await ClassModel.findById(classId);
        // Check if both the user and the class exist
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (!classObj) {
            return res.status(404).send('Class not found');
        }
        // Add the class to the user's classes array if not already present
        if (!user.classes.includes(classId)) {
            user.classes.push(classId);
            await user.save();
        }
        // Add the user to the class's members array if not already present
        if (!classObj.members.includes(memberId)) {
            classObj.members.push(memberId);
            await classObj.save();
        }
        res.redirect('/member');
    } catch (error) {
        res.status(500).send('Error adding member to class: ' + error.message);
    }
});

//Book private sessions
router.get('/book-session/:id', checkStudentSession, async (req, res) => {
    try {
        var coachId = req.params.id;
        console.log("GET /book-session/:id - coachId:", coachId);
        var coach = await UserModel.findById(coachId);
        if (!coach) {
            return res.status(404).send('Coach not found');
        }
        res.render('coach/bookingPage', { coach }); // Render a view for booking
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

router.post('/book-session', checkStudentSession,  async (req, res) => {
    var { coachId, start } = req.body;
    var studentId = req.session.userId;
    if (!mongoose.Types.ObjectId.isValid(coachId) || !mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).render('coach/bookingPage', { error: 'Invalid IDs' });
    }
    var startDate = new Date(start);
    var currentTime = new Date();
    // Check if the booking is in the past
    if (startDate < currentTime) {
        return res.status(400).render('coach/bookingPage', { error: 'Cannot book a session in the past.' });
    }
    try {
        var endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2-hour sessions
        var newBooking = new BookingModel({
            coachId,
            studentId,
            title: req.body.title,
            description: req.body.description,
            start: startDate,
            end: endDate,
            status: 'pending',
        });
        console.log(studentId, coachId)
        await newBooking.save();
        res.redirect('/');
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).render('coach/bookingPage', { error: 'Error creating booking' });
    }
});

router.get('/mybookingList', checkStudentSession, async (req, res) => {
    try {
        const userId = req.session.userId; // Get the user's session ID
        const MyBookingList = await BookingModel.find({ 
            studentId: userId,
            status: { $ne: 'rated' } // Fetch bookings for the logged-in student
        })
        .populate('coachId', 'username');
        console.log("List for user:", userId); // Log the user's session ID
        console.log("List for user:", MyBookingList); // Log the user's session ID
        res.render('member/pastSessions', { MyBookingList }); // Render to the student's booking page
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).send("Error retrieving bookings: " + error.message);
    }
});

//GEt list of my pasts sessions
router.get('/pastSessions', checkStudentSession, async (req, res) => {
    try {
        const PastList = await BookingModel.find({ 
            studentId: req.session.userId // Fetch bookings for the logged-in student
        });
        res.render('member/pastSessions', { PastList }); // Render to the student's booking page
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).send("Error retrieving bookings: " + error.message);
    }
});

//View schedule
router.get('/bookingSchedule', checkLoginSession, (req, res) => {
    res.render('member/schedule');
});

//Send appointments to callendar
router.get('/bookingData', checkLoginSession, async (req, res) => {
    try {
        var acceptedBookings = await BookingModel.find({ status: 'accepted' });
        var events = acceptedBookings.map(booking => ({
            title: booking.title,
            start: booking.start,
            end: booking.end
        }));
        res.json(events);
    } catch (error) {
        res.status(500).send("Error fetching accepted bookings: " + error.message);
    }
});

router.post('/rate-coach', async (req, res) => {
    try {
        const { bookingId, rating, comments } = req.body;
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required." });
        }
        const numericRating = parseInt(rating, 10);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
        }
        const booking = await BookingModel.findByIdAndUpdate(
            bookingId,
            { rating: numericRating, status: 'rated' }, // Update rating and set status to 'complete'
            { new: true, runValidators: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        res.redirect('/coach/coaches');
    } catch (error) {
        console.error("Error submitting rating:", error);
        res.status(500).json({ success: false, message: "Error submitting rating." });
    }
});

module.exports = router;
