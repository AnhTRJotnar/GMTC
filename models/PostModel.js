var mongoose = require('mongoose');
var PostSchema = mongoose.Schema(
    {
        // Store the document file name as a string
        media:{
            type: String
        },  

        description: String,

        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'users' 
        },

        date: {
            type: Date,
            require: true,
        },

        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'comments'
            }
        ]
    }
)
var PostModel = mongoose.model("posts", PostSchema);
module.exports = PostModel;