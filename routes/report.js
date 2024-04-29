const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');
const ClassModel = require('../models/ClassModel');
const TechniqueModel = require('../models/TechniqueModel');
const { checkAdminSession, checkLoginSession } = require('../middlewares/auth');


router.get('/', checkAdminSession, checkLoginSession, async (req, res) => {
    try {
        const numMembers = await UserModel.countDocuments({});
        const numClasses = await ClassModel.countDocuments({});
        const numPosts = await PostModel.countDocuments({});
        const numResources = await TechniqueModel.countDocuments({});
        res.render('admin/report', {
            numMembers,
            numClasses,
            numPosts,
            numResources
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;