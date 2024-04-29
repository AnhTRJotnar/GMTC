const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const CommentModel = require('../models/CommentModel');
const PostModel = require('../models/PostModel');
const moment = require('moment');
const {checkLoginSession, checkAdminSession, checkCoachSession} = require('../middlewares/auth');


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

// Get posts listing with associated comments
router.get('/posts', async (req, res) => {
    try {
        const PostList = await PostModel.find({})
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'username image'
                }
            })
            .populate('userId', ['username', 'image'])

        const formattedPosts = PostList.map(post => ({
            ...post.toObject(), // Converts Mongoose document to plain object
            formattedDate: moment(post.date).format('h:mm A, D/MM/YYYY'), // Custom date format
            mediaType: post.media && post.media.endsWith('.mp4') ? 'video' : 'image',
        }));

        const ReversePosts = formattedPosts.reverse();

        res.render('post/index', { PostList: ReversePosts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/posts', checkLoginSession, upload.single('media'), async (req, res) => {
    const { description } = req.body;
    const userId = req.session.userId;
    try {
        const newPost = {
            description,
            date: new Date(),
            userId,
            comments: [],
        };
        if (req.file) {
            newPost.media = req.file.filename;
        }
        await PostModel.create(newPost);
        res.redirect('/post/posts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/delete/:id', checkLoginSession, async (req, res) => {
    try {
    const postId = req.params.id;
    const currentUserId = req.session.userId;

    const post = await PostModel.findById(postId);
    if (!post) {
    console.log("Technique not found");
    return res.status(404).send("Technique not found");
    }

    if (post.userId.toString() !== currentUserId) {
    console.log("Unauthorized attempt to delete technique");
    return res.status(403).send("Unauthorized to delete this technique");
    }

    await PostModel.findByIdAndDelete(postId);
    console.log("Technique deleted successfully");
    res.redirect('/post/posts');
} catch (err) {
    console.error("Error deleting technique:", err);
    res.status(500).send("Internal server error");
}
});

// Add new comment
router.post('/comments', checkLoginSession, async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.session.userId;
    try {
        const newComment = await CommentModel.create({
            content,
            date: new Date(),
            userId,
            postId,
        });
        // Find the corresponding post and update its comments array
        const post = await PostModel.findById(postId);
        if (post) {
            post.comments.push(newComment._id);
            await post.save();
        } else {
            console.error('Post not found');
            return res.status(404).send('Post not found');
        }
        res.redirect('/post/posts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/cmtdelete/:id', checkLoginSession, async (req, res) => {
    try {
    const commentId = req.params.id;
    const currentUserId = req.session.userId;

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
    console.log("Technique not found");
    return res.status(404).send("Technique not found");
    }

    if (comment.userId.toString() !== currentUserId) {
    console.log("Unauthorized attempt to delete technique");
    return res.status(403).send("Unauthorized to delete this technique");
    }

    await CommentModel.findByIdAndDelete(commentId);
    console.log("Technique deleted successfully");
    res.redirect('/post/posts');
} catch (err) {
    console.error("Error deleting technique:", err);
    res.status(500).send("Internal server error");
}
});


module.exports = router;
