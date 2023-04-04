const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({  // Creating a new model i.e a new collection named 'tasks' which will store all the tasks
    description : {
        type : String,
        required : true,
        trim : true,
    },
    completed : {
        type : Boolean,
        default : false
    },
    owner : {   // This property or field will store the id of the 'user' instance who created this specific task
        type : mongoose.Schema.Types.ObjectId,  // This is a type provided by the mongoose library which will store 'Object ID's' of some object which in this case would the 'user' instance id's
        required: true,
        ref : 'User'    // The 'ref' property is providied by mongoose to set up a relationship with some other model which in this case is the 'User' model
    }
}, {
    timestamps : true   // This will generate two fields -> "createdAt" and "updatedAt" which will have the information about when the task was created and when was it last updated
})

const tasks = mongoose.model('tasks',tasksSchema);


module.exports = tasks;