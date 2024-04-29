const express = require('express');
var router = express.Router();
var ClassModel = require('../models/ClassModel');
var UserModel = require('../models/UserModel');
var mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
var { checkLoginSession, checkAdminSession } = require('../middlewares/auth'); // Assuming authentication middleware

const classValidation = [
    // Validation checks
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('daysOfWeek', 'At least one day of the week must be selected').notEmpty(),
    check('startTime', 'Start time is required').notEmpty(),
    check('endTime', 'End time is required').notEmpty(),
    check('startRecur', 'Start recurrence date is required').notEmpty(),
    check('endRecur', 'End recurrence date is required').notEmpty(),
    // Custom validation for times and dates
    check('startTime')
        .custom((value, { req }) => {
            const start = new Date(`1970-01-01T${value}:00Z`);
            const end = new Date(`1970-01-01T${req.body.endTime}:00Z`);
            if (start >= end) {
                throw new Error('Start time must be before end time.');
            }
            return true;
        }),
    check('startRecur')
        .custom((value, { req }) => {
            const start = new Date(value);
            const end = new Date(req.body.endRecur);
            if (start >= end) {
                throw new Error('Start recurrence date must be before end recurrence date.');
            }
            return true;
        }),
];

// GET: List all classes
router.get('/', checkLoginSession, async (req, res) => {
    var ClassList = await ClassModel.find({}).populate('members', 'username');
    res.render('class/index', { ClassList });
});

//class event schedule
router.get('/class-events', checkLoginSession, (req, res) => {
    res.render('class/class-events');
});

//add new class
router.get('/add', checkAdminSession, async (req, res) => {
    var users = await UserModel.find({});
    res.render('class/add', {users});
})

// router.post('/add', checkAdminSession, async (req, res) => {
//     try {
//         var { title, description, daysOfWeek, startTime, endTime, startRecur, endRecur, members } = req.body;

//         if (!Array.isArray(daysOfWeek)) {
//             // If it's a single day, convert it to an array
//             daysOfWeek = [daysOfWeek];
//         }   

//         var newClass = new ClassModel({
//             title,
//             description,
//             daysOfWeek: daysOfWeek.map(Number), // Ensure daysOfWeek is an array of numbers
//             startTime,
//             endTime,
//             startRecur: new Date(startRecur), // Convert to Date object
//             endRecur: new Date(endRecur),      // Convert to Date objects
//             members: Array.isArray(members) ? members : [members],
//         });

//         await newClass.save();
//         console.log(newClass);
//         res.redirect('/class'); // Redirect to the class listing page
//     } catch (error) {
//         console.error('Error adding new class:', error);
//     }
// });

router.post('/add', checkAdminSession, classValidation, async (req, res) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            const errorMessages = validationErrors.array().map((err) => err.msg);
            return res.status(400).render('class/add', {
                errors: errorMessages,
                classData: req.body,
            });
        }

        var { title, description, daysOfWeek, startTime, endTime, startRecur, endRecur, members } = req.body;

        if (!Array.isArray(daysOfWeek)) {
            daysOfWeek = [daysOfWeek];
        }

        var newClass = new ClassModel({
            title,
            description,
            daysOfWeek: daysOfWeek.map(Number),
            startTime,
            endTime,
            startRecur: new Date(startRecur),
            endRecur: new Date(endRecur),
            members: Array.isArray(members) ? members : [members],
        });

        await newClass.save();
        console.log('Class created successfully:', newClass);
        res.redirect('/class'); // Redirect upon successful class creation
    } catch (error) {
        console.error('Error adding new class:', error);
        return res.status(500).send('An error occurred while adding the class. Please try again later.');
    }
});

router.get('/classData', checkLoginSession, async (req, res) => {
    try {
        var currentUserId = req.session.userId;
        console.log('Current User ID:', currentUserId);
        // Fetch classes where the user is a member
        console.log('Querying for classes with user ID:', currentUserId);
        var classes = await ClassModel.find({ members: { $in: [currentUserId] } });
        console.log('Classes found:', classes);

        // Map the data to the desired format
        var eventData = classes.map(cls => ({
            title: cls.title,
            startTime: cls.startTime, // Use start instead of startTime
            endTime: cls.endTime,     // Use end instead of endTime
            daysOfWeek: cls.daysOfWeek,
            startRecur: cls.startRecur,
            endRecur: cls.endRecur,
            allDay: false         // Set allDay to false
        }));

        res.json(eventData);
    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json({ message: 'Error fetching class data' });
    }
});

// DELETE: Delete a class by ID
router.get('/delete/:classId', checkAdminSession, async (req, res) => {
    try {
        const { classId } = req.params;

        // Delete the class
        await ClassModel.findByIdAndDelete(classId);

        res.redirect('/class')
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Error deleting class' });
    }
});

module.exports = router;
