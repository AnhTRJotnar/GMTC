var express = require('express');
var router = express.Router();
const multer = require('multer');
var TechniqueModel = require('../models/TechniqueModel');
const moment = require('moment');
const {checkLoginSession, checkAdminSession, checkCoachSession, checkStudentSession, checkMultipleSession} = require('../middlewares/auth');
const { convertYoutubeUrlMiddleware } = require('../middlewares/convert');

// Multer configuration
const prefix = Math.floor(Math.random() * 100000000) + 1;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, 'public/images');
        } else if (file.mimetype.startsWith('video')) {
            cb(null, 'public/videos'); 
        } else {
            cb(new Error('File type not supported'));
        }
    },
    filename: (req, file, cb) => {
        let fileName = prefix + "_" + file.originalname;
        cb(null, fileName);
    }
});
const upload = multer({ storage: storage });

// Get all techniques with associated data (e.g., coach who created them)
router.get('/', checkMultipleSession(['coach', 'student']) ,checkLoginSession, async (req, res) => {
    try {
        var TechniqueList = await TechniqueModel.find({})
            .populate('userId', ['username', 'image']);

        const formattedTech = TechniqueList.map(tech => ({
            ...tech.toObject(), // Converts Mongoose document to plain object
            formattedDate: moment(tech.date).format('h:mm A, D/MM/YYYY'), // Custom date format
            mediaType: tech.media && tech.media.endsWith('.mp4') ? 'video' : 'image',
        }));

        const ReverseTech = formattedTech.reverse();
        res.render('technique/index', { TechniqueList: ReverseTech }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/add', checkCoachSession, async (req, res) => {
    var TechniqueList = await TechniqueModel.find({})
    res.render('technique/index', { TechniqueList });
})
/// Create a new technique with form data and a possible file upload
router.post('/add', checkCoachSession , upload.single('media'), convertYoutubeUrlMiddleware, async (req, res) => {
    const { name, description, videoUrl } = req.body; 
    const userId = req.session.userId;
    try {
        const newTechnique = {
            name,
            description,
            videoUrl,
            date: new Date(),
            userId,
        };
        if (req.file) {
            newTechnique.media = req.file.filename;
        }
        await TechniqueModel.create(newTechnique);
        res.redirect('/technique');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/delete/:id', async (req, res) => {
    try {
    const techniqueId = req.params.id;
    const currentUserId = req.session.userId;

    const technique = await TechniqueModel.findById(techniqueId);
    if (!technique) {
    console.log("Technique not found");
    return res.status(404).send("Technique not found");
    }

    if (technique.userId.toString() !== currentUserId) {
    console.log("Unauthorized attempt to delete technique");
    return res.status(403).send("Unauthorized to delete this technique");
    }

    await TechniqueModel.findByIdAndDelete(techniqueId);
    console.log("Technique deleted successfully");
    res.redirect('/technique');
} catch (err) {
    console.error("Error deleting technique:", err);
    res.status(500).send("Internal server error");
}
});


module.exports = router;