var mongoose = require('mongoose');
var CommentSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            default: null
        },
        // The user that posts the comment
        userId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'users' 
        },
        date: {
            type: Date
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'posts'
        },
    }
);
var CommentModel = mongoose.model("comments", CommentSchema);
module.exports = CommentModel;