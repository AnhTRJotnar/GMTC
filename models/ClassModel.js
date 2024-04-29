var mongoose = require('mongoose');

var classSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true 
    },  // 'HH:mm' format
    endTime: { 
        type: String, 
        required: true 
    },    // 'HH:mm' format
    daysOfWeek: [{ 
        type: Number 
    }], // 0-6, representing Sunday-Saturday
    startRecur: {
        type: Date 
    }, // Recurrence start date
    endRecur: { 
        type: Date 
    },
    // Recurrence end date
    members: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users' 
    }]
});

var ClassModel = mongoose.model('classes', classSchema);

module.exports = ClassModel;
