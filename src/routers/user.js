const express = require('express');
const multer = require('multer'); // Importing the 'multer' npm module to add support for uploading files
const User = require('../models/user'); // Importing the 'User model' that we have created using mongoose
const auth = require('../middleware/auth'); // Importing the 'auth.js' file to use it as a middleware for authenticating users 
const tasks = require('../models/tasks');
const sharp = require('sharp'); // Using the sharp npm module to resize the images that the user uploads from their side or the client side and convert them to a unified format like '.jpeg'  '.png' '.jpg' etc
const {sendWelcomeEmail , sendCancellationEmail} = require('../emails/account'); // Getting the 'sendWelcomeEmail' and 'sendCancellationMail' property from or exported by the 'account.js' file under the 'emails' directory which will be used to trigger or send a mail to our desired users

const router = new express.Router();    // Creating the router variable to use it with our post,get,patch,delete requests



router.post('/users',async (req,res) => {    // Using the 'post' method in express to create new 'user' instances or resource
    const user = new User(req.body);

    try{
        const token = await user.generateAuthToken();   // Generating a new token for the new user
        await user.save();  // Saving the user to the database
        sendWelcomeEmail(user.email,user.name); // Using the 'sendWelcomeEmail' function that we have created in the 'account.js' file under the 'emails' directory specifically designed to send emails to our users who registers but we can also use this same 'sendWelcomeEmail' method to send whatever mail whenever we want
        res.status(201).send({user,token});
    }catch (e){
        res.status(400).send(e);
    }
})


//Logging in user
router.post('/users/login', async (req,res) =>{ // Used for logging in users who already have an account in our database
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password);  // Creating a custom method for our user model called 'findByCredentails'
        const token = await user.generateAuthToken();   // This method is defined in the 'user.js' inside the 'models' directory and is used to generate a new JSONwebtoken or a token in general
        console.log(token);
        //res.send({user : user.getPublicProfile(),token});   // We are sending the value returned from the function 'user.getPublicProfile()' and not the user itself because we don't want to display the 'password' and the 'token' array that the user has 
        res.send({user , token});   // Without even calling the 'toJSON()' method we'll be able to return the 'user' JSON with the password and tokens not visible to the user in postman or essentially deleting them because the express npm module automatically calls the 'JSON.stringify(-Object Literal-)' method whenever the 'res.send(...)' is executed with one or multiple object literals inside it which get their JSON value returned via going through the 'toJSON()' method that we have defined in the 'user.js' file under the 'models' folder
    }catch (e){
        res.status(400).send(e);
    }
})


//Logging out the current user
router.post('/users/logout' , auth , async(req, res) => {
    try{

        req.user.tokens = req.user.tokens.filter((token) => {   // Using the 'filter()' method to iterate over each of the token inside the 'req.user' property and setting the 'req.user.tokens' property or field to tokens without the current token or here we are essentially deleting the token we used to login the user
            return token.token !== req.token;   // returning the tokens array but without the current token with which the user is currently logged in
        })

        await req.user.save(); // Saving the user again to the database but now we have deleted the token which was used to login the user for the current session

        res.send()
    }catch(e){
        res.status(500).send();
    }
}) 

//Logging out all the other users except the current user
router.post('/users/logoutAll' , auth , async (req,res) => {
    try{    
        req.user.tokens = req.user.tokens.filter((token) => {   // Using the 'filter(...)' method to sort of delete all the other tokens except the token we are currently logged in with
            return token.token === req.token;   // Returning the only token which is equal to the token that has been set from the 'auth' function which is taken from the 'auth.js' file
        })

        await req.user.save();  // Saving the user again once we have deleted all the other tokens so that we are ,or our token is, the only one who is logged 
        res.send();
    }catch(e){
        res.status(500).send();
    }
})

// Logout all the users even the current one 
router.post('/users/logoutAll2' , auth, async (req,res) => {
    try{
        req.user.tokens = [];   // We are essentially wiping out all the tokens present inside the token array of the user we are currently logged in with
        await req.user.save();  // Saving the changes with all the tokens deleted
        res.send();
    }catch(e){
        res.status(500).send();
    }
})

// Getting into the user profile once the user has logged in
router.get('/users/me',auth , async (req,res)=> {      // This is to read multiple documents at once from the database
    
    // This will send all the users present in the 'users' collection in the dataabase
    // try{     
    //     const users = await User.find({});
    //     res.status(200).send(users);
    // }catch(e){
    //     res.status(500).send(e);
    // }

    //This will return only the user that is authenticated via our middleware 'auth'
    try{
        const user = req.user;  // The 'req.user' property from the client side HTTP request here will have our authenticated user and the value of 'req.user' has been assigned in the 'auth.js' middleware file once the user is authenticated
        res.send(user);
    }catch(e){
        res.status(500).send(e);
    }
    
    // User.find({}).then((users) => {     // Uses the -modelName-.find(...)  syntax to find multiple documents from the database
    //     res.send(users);
    // }).catch((error) => {
    //     res.status(500);
    //     res.send(error);
    // })
})

// Uploading profile pic for the user 
const uploadProfilePic = multer({   // Using the 'multer' npm module to let the client upload stuffs to the server
    //dest : 'avatar', // Setting destination path where the documnets or images sent from the client will be saved i.e inside the 'avatar' directory in our project file
    limits:{
        fileSize : 1000000  // Limits the size of the file that the client or the user can upload from their side to be of 1 mb or 1000000 bits as 1mb = 1000000 bits
    },
    fileFilter(req,file,cb){    // Using the 'fileFilter' method to filter or specify the validation that the file which the user wants to upload has to pass in order to be uploaded to the server , the 'file' parameter here will contain all the information about the file that will be uploaded by the client server or the user and the 'cb' is the callback function which will be called when either the file which is the user wants to upload will pass all the validation or some error popped up
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){  // Using the 'match()' function which allows the use of regular exressions to check whether the files uploaded by the client side or the user ends with the extension '.jpg' or '.jpeg' or '.png'
            return cb(new Error("Please upload an image which is in the png or jpg or jpeg format"));   // Throwing an error if the uploaded picture extension is not correct from the client server or the user
        }   
        cb(undefined,true); // If the uploaded profile pic is in the correct format we call the callback function again with the first parameter as 'undefined' and the second parameter as true stating that everything went well and the file is then uploaded to our server

    }   
})

router.post('/users/me/avatar', auth , uploadProfilePic.single('avatar'),async (req,res)=>{ // Using the 'single(...)' function to assign the key where the client from their end will specify this key to upload documents or images to the server
    const buffer = await sharp(req.file.buffer).resize({    // Using the 'sharp' npm module to resize the image that the user or the client side or the client server upload and then converting it to a unified format , in this case we choose '.png()' format
        width : 250,    // Setting up the width of the image uploaded by the user or client server or client side to a certain value
        height : 250    // Setting up the height of the image uploaded by the user or client server or client side to a certain value
    }).png().toBuffer();    // Converting the image uploaded to '.png()' format and then to 'Buffer' type as we have to store it to the user's instance 'avatar' property or field
    
    //req.user.avatar = req.file.buffer; // This will store the image or file uploaded by the client side or the user ,in the buffer or binary form, to the 'avatar' property that the 'user's' instance has 
    
    req.user.avatar = buffer;   // Store the 'buffer' property to the user's instance 'avatar' property or field
    await req.user.save();  // Saving the user once again after the changes are made and the picture or the file has been validated successfully to be uploaded
    res.send();
} , (error, req, res, next) => {    // If an error occurs then this function will run and the four parameters here i.e 'error', 'req', 'res', 'next' are very necessary
    res.status(400).send({  
        error : error.message   // Sending the error message as a JSON response back to the client server or to the client side which is stored in the 'error.message' property
    })
})



// Deleting profile pic of the user - if needed
router.delete('/users/me/avatar' , auth, async (req,res) => {
    try{
        
        req.user.avatar = undefined;    // Setting the 'avatar' property to 'undefined' which essentially just deletes the 'avatar' field from the user's instance
        await req.user.save();
        res.send();
    }catch(e){
        res.status(400).send(e);
    }
})

// Router for showing up the profile pic of the user that is requested via an id
router.get('/users/:id/avatar' ,async (req,res) => {
    try{
        const user = await User.findById(req.params.id);    // Finding the user whose id is mentioned in the 'req.params' array
        
        if(!user || !user.avatar){
            throw new Error();
        }

        res.set('Content-Type', 'images/png');  // Setting up the 'Content-Type' property of the response header of the url or the router to render a 'jpg' type 'image' , basically telling the client server or the user what type of data they are getting back

        res.send(user.avatar);  // Sending the image to be rendered to the client
    }catch(e){
        res.status(404).send();
    }
})

// Finding a user by their 'user ID' 
// router.get('/users/:id', async (req,res) =>{ // This is to read a single document from the database using route paramters
//     const _id = req.params.id;  // The 'req.params' contains all the data in an array which is given after the '/users/' in the above route
    
//     try{
//         const user = await User.findById(_id);
//         if(!user){
//            return res.status(404).send();
//         }
//         res.send(user);
//     }catch (e){
//         res.status(500).send(e);
//     }
    
//     // User.findById(_id).then((user) => {
//     //     if(!user){
//     //         res.status(404);    // Used for 'Not Found' errors
//     //         return res.send();
//     //     }
//     //     return res.send(user);
//     // }).catch((error) => {
//     //     res.status(500);    // Used if there is an error from the server side 
//     //     return res.send(error);
//     // })
// })


// Old method to patch or udpate a user by their 'id' instance 
// router.patch('/users/:id' , async (req,res) => {   // Using the 'patch(...)' function to update an user document in the 'Users' collection
//     const _id = req.params.id;  // Used to get the id which  is sent by the server in the 'req' parameter
//     const updates = Object.keys(req.body); // stores the property or key values of all the updates to be done which is stored by the user
//     const allowedUpdates = ['name','password','email','age'];   // Contains all the property values which can be updated
//     const isValidOperation = updates.every((update) => {    // checks whether every property on the 'to be updated properties' which are sent from the server are 'valid' to be updated and return true or false  
//         return allowedUpdates.includes(update);
//     })
    
//     if(!isValidOperation){  // Checks whether the 'isValidOperation' is false or true
//         return res.status(400).send({error : "Invalid Updates !"});
//     }


//     try{
//         // Since we are going to use middlewares we'll have to adjust the patch or update function a little
//         const user = await  User.findById(_id);
//         updates.forEach((update) => {
//             user[update] = req.body[update];    // We have to assign the previously existing values to the new value passed in by the client as the server body 
//         })
//         await user.save();  // Saving the user as we used to when we created a new user

//         //const user = await User.findByIdAndUpdate(req.params.id, req.body , {new : true , runValidators :true}); // Here we are using the 'async/await' functionality to update a user in the 'Users' collection which has the id of '_id' and the update will be passed in from the server as the 'request' body and the {new : true , runValidator : true} are used for returning the updated user document to the 'const user' varaible and to make sure that the validation is done on the update that is passed in by the user                                                           
//         if(!user){
//             res.status(404).send();
//         }
//          res.send(user);
//     }catch(e){
//         res.status(400).send(e); // Here we are only handling if the update given by the server fails in validation and we are currently neglecting the error that might be caused from the server side i.e the 500 error
//     }
// })


// New Method to update the user using authentication with the 'auth.js' file 
router.patch('/users/me' , auth,  async (req,res) => {   // Using the 'patch(...)' function to update an user document in the 'Users' collection

    const updates = Object.keys(req.body); // stores the property or key values of all the updates to be done which is stored by the user
    const allowedUpdates = ['name','password','email','age'];   // Contains all the property values which can be updated
    const isValidOperation = updates.every((update) => {    // checks whether every property on the 'to be updated properties' which are sent from the server are 'valid' to be updated and return true or false  
        return allowedUpdates.includes(update);
    })
    
    if(!isValidOperation){  // Checks whether the 'isValidOperation' is false or true
        return res.status(400).send({error : "Invalid Updates !"});
    }


    try{
        // Since we are going to use middlewares we'll have to adjust the patch or update function a little
        const user = req.user;  // Gets the user from the 'req.user' HTTP client request whose value is set in the 'auth.js' file after authentication
        updates.forEach((update) => {
            user[update] = req.body[update];    // We have to assign the previously existing values to the new value passed in by the client as the server body 
        })
        await user.save();  // Saving the user as we used to when we created a new user
        res.send(user);
    }catch(e){
        res.status(400).send(e); // Here we are only handling if the update given by the server fails in validation and we are currently neglecting the error that might be caused from the server side i.e the 500 error
    }
})


// Includes the authentication 'auth.js' file
router.delete('/users/me', auth ,async (req , res) => { // Using the 'delete' function of express to delete a document inside of the 'Users' collection in our database
    const _id = req.params.id;

    try{

        //Old method of deleting 

        // const deletedUser = await User.findByIdAndDelete(_id); // We'll use the mongoose 'findByIdAndDelete(...)' to delete a document from the 'Users' collection in the database 
        // if(!deletedUser){   // Checks whether there provided user exists
        //     res.status(404).send(); // Sends a Not Found response to the server 
        // }
        // res.send(deletedUser); // Sends the user to the client which was deleted

        
        //New method of deleting
        // await tasks.deleteMany({   // Here we are deleting all the tasks that this user has created using the mongoose 'deleteMany({})' function but a better way is to use middlewares which we have created in the 'user.js' file under the models folder or directory
        //     owner : req.user._id
        // })
        await req.user.remove();    // This 'user.remove()' method is a method offered by mongoose to delete a document
        sendCancellationEmail(req.user.email, req.user.name);   // Sending a mail to the user via the 'sendCancellationEmail(...)' method when the user removes his/her or their account
        res.send(req.user);

    }catch(e){
        res.status(400).send(e);    // Sends a 'Bad Request' error to the client
    }   
})
module.exports = router;