var mongoose = require('mongoose');
var TechniqueSchema = mongoose.Schema({
    name:{
        type: String,
    }, 
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    media: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    },
    uploadDate: {
        type: Date,
        default: Date.now, // Automatically set to the current date when creating a document
    },
})

var TechniqueModel = mongoose.model("techniques", TechniqueSchema);
module.exports = TechniqueModel;