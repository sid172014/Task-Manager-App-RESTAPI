const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tasks = require('./tasks');

// Here we are creating a seperate schema for the user model so we can be able to use 'middlewares'
const userSchema = new mongoose.Schema({     // Creating a new model i.e a new collection named 'User' which will store the users
    name: {
        type : String,
        required : true // Sets this field to be mandatory and has to be given by the user when a new user is created 
    },
    email: {
        type:String,
        unique : true,  // Makes sure that every email is unique and there are no duplicate emails
        required : true,
        trim:true, // Will remove any extra spaces that will be present in the email typed by the user
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("The Email Provided is invalid");
            }
        }
    },
    age : {
        type : Number,
        default : 0,    // Will assign a default value of 0 to the age field if the age is not provided when creating an instance of this 'User' model
        validate(value) {
            if(value < 0){
                throw new Error("Age must be a positive number");
            }
        }
    },

    //adding a password field to the user
    password : {
        type: String,
        required : true,
        trim : true,
        minlength: 7,   // This property ensures that the minimum length of the password given when creating a new user should be atleast or greater than 7 charecters
        validate(value){
            // if(value.length <= 6){  // Another way to check whether the input length of the password is equal to greater than 7 charecters
            //     throw new Error("The password length is less than 6");
            // }
            if(validator.equals(value.toLowerCase(),"password")){
                throw new Error("Invalid Password try Again , The password shouldn't be 'password' itself");
            } 
        }
    },
    tokens : [{ // This is a field which will store an array of objects which in this case will the 'tokens' that will be generated for particular 'user' instance
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer   // This field will contain the profile picture of the 'user' model instance which will be created by the client or the user himself
    }
} , {
    timestamps : true   // This will generate two fields for every instance of the 'user' model we create which are -> "createdAt" and "updatedAt" which will basically have the values of when the model was created and when it was last updated
})

//Setting up a 'virtual property' here 
userSchema.virtual('tasks' , {  // The first parameter here is the property or field name that we want to have

    // We have to establish a relationship between the '_id' variable here in the 'users' model and the '_id' being stored in the 'owner' property in the 'tasks' model

    ref: 'tasks',   // This is to establish a relationship between this 'User' model and the 'tasks' model which is a different collection
    localField:'_id',   // This will basically have an access to all the values of the '_id' variable inside the 'Users' collection that is why it is called 'localField'
    foreignField: 'owner'   // This is the name of the property or field on the other model which will store '_id' of the 'user' who creates a task 
})

//Here we define the 'getPublicProfile()' method to return the user instance without the password and the token array so only 'name' , 'email' and 'age' property or field will be visible to the user
// userSchema.methods.getPublicProfile = function () { // We dont have it as an 'async/await' function because we are not using this function to save or do anything with our database that will make us to use the 'await' keyword
//     const user = this;
//     const userObject = user.toObject(); // This method will retunr back the 'user' data in raw form or object literal form
  
//     delete userObject.password; // Deletes the 'password' property or field from the 'userObject' literal 
//     delete userObject.tokens; // Deletes the 'token' array property or field from the 'userObject' literal
  
//     return userObject;
// }

// This function below is a replica of the 'getPublicProfile()' function above except we have changed the function name to 'toJSON'
// The 'toJSON()' method or function should exactly be spelt the way it is currently as this method returns the value when the 'JSON.stringify(...)' method is called , which is the case everytime when we use the 'res.send(...)' function to send data back to the client
userSchema.methods.toJSON = function () { // We dont have it as an 'async/await' function because we are not using this function to save or do anything with our database that will make us to use the 'await' keyword
    const user = this;
    const userObject = user.toObject(); // This method will return back the 'user' data in raw form or object literal form and store it in another constant called 'userObject'
  
    delete userObject.password; // Deletes the 'password' property or field from the 'userObject' literal 
    delete userObject.tokens; // Deletes the 'token' array property or field from the 'userObject' literal
    delete userObject.avatar; // Deletes the 'avatar' property or field from the 'userObject' literal becuase it would take extra time for the server to fetch this property or field as it is large in size
    return userObject;
}
//We haved defined a custom function called 'generateAuthToken()' in the user.js router with a post request of '/users/login' , so here we define that function using the 'methods' of the schema which will help us to use these methods with the instances of the 'user' model  
userSchema.methods.generateAuthToken = async function() {
    const user = this;  // For using the 'this' variable we didn't use the ES6 Arrow functions instead we used the 'function(){...}' syntax
    const token = jwt.sign({_id : user._id.toString()},process.env.JWT_SECRET);  // Creating a new token using the sign method

    //  Setting or Concatenating the 'tokens' field or property of the user automatically to a newly created token that we got from the line above
    user.tokens = user.tokens.concat({token : token});  // Using the 'concat(..)' method on the 'user.tokens' array to concatenate the newly generated token to the 'tokens' array which should be a string as the token property defined in the 'userSchema' requires it to be

    await user.save();
    return token;
}

// We have defined a custom function called 'findByCredentials' in the user.js router with a post request of '/users/login' , so here we define that function using the 'statics' which can only be applied when the 'User' model as a whole
userSchema.statics.findByCredentials = async (email , password) => {
    const user = await User.findOne({email:email});
    if(!user) {
        throw new Error("Unable to Login");
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error("Unable to Login");
    }
    return user;
}


// Note the 'pre(...)' function comes in before we actually initiate the an instance of the user model
userSchema.pre('save',async function (next){
    const user = this;
    
    if(user.isModified('password')){    // Checking if the 'password' field is modified in the instance of the user or even if it first being created
        user.password = await bcrypt.hash(user.password,8); // Hashing the password passed in using the 'bcryptjs' npm module
    }

    next(); // This has to be called to exit the middleware 'Pre(...)' method otherwise it will forever be stuck
})

// Using 'middleware' functionality to delete all the tasks that the user ,which is logged in, has created when the 'remove()' function is called on the instance of this user model
userSchema.pre('remove', async function(next){
    const user = this;  // Using the ES5 function keyword to define the function as we have to use the 'this' keyword
    await tasks.deleteMany({    // Using the 'deleteMany()' function to delete all the tasks that the currently logged in user has created
        owner : user._id
    })
    next();
})

const User = mongoose.model('User',userSchema); // Passing in the collection name and the schema variable 

// Using the middleware 'Pre(...)' method - takes in two parameters i.e => event name , standard function which does not require the arrow function as it deals with the'this' varaible 



module.exports = User;