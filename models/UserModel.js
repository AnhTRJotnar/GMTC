var mongoose = require('mongoose');
var UserSchema =mongoose.Schema({
        username: {
            type: String,
            unique: true,
            required: true
        },

        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true 
        },

        image: {
            type: String,
            required: true
        },

        classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }],
    }
);
var UserModel = mongoose.model('users', UserSchema);
module.exports = UserModel;
