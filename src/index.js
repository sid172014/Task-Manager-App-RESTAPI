const express = require('express');
require('./db/mongoose');   // IMPORTANT IMPORT -> requiring the mongoose file to make sure the mongoose connection is succesfully done from the mongoose.js file
const User = require('./models/user');  // Importing the  'user.js' model to create new 'user' instances or resource
//const tasks = require('./models/tasks');
const userRouter = require('./routers/user');   // Importing the 'userRouters' or the user Routers that we have created which performs the get,patch,post,delete operations
const tasksRouter = require('./routers/tasks'); // Importing the 'taskRouters' or the tasks Routers that we have created which performs the get,patch,post,delete operations 

const app = express();
const port = process.env.PORT


// Learning MiddleWares

// This is a 'middleware' or an express middleware function checks if the client or the user on the client side is 'Authenticated' to perform the operations he/she is requesting 
// app.use((req,res,next) => {
//     console.log(req.method,req.path);   // The 'req.method' will give us the value of the 'method' like -> GET , POST , PATCH , DELETE etc  that has been passed in by the user and the 'req.path' will give us the value of the router path that the user or client provides like -> '/users' , '/tasks' etc
//     next(); // This has to be called in order to the let the client connection go through the next steps once they are 'Authenticated'
// })

// Making another 'middleware' function to disable the 'GET' requests that the client or the user sends
// app.use((req,res,next) => {
//     if(req.method === 'GET'){
//         res.send("The 'GET' requests are disabled please try again after sometime");
//     }else{
//         next();
//     }
// })

// Making a 'middleware' function to put our website to 'maintainance mode' or basically disabling all the requests i.e POST , GET , PATCH , DELETE requests that the user makes
// app.use((req,res,next) => {
//     if(req.method === 'GET' || req.method === 'POST' || req.method === 'DELETE' || req.method === 'PATCH'){
//         res.status(503).send("The website is on maintenance");
//     }else{
//         res.send("Couldn't recognize the command");
//     }
// })

//Udemy way of using the 'middleware' function to put the website under 'maintenance' mode
// app.use((req,res,next) => {
//     res.status(503).send("The website is under maintenance");
// })





// End of Middlewares Learning

//File Upload Using 'Multer' npm module which uses a middleware to accept the upload of files
// const multer = require('multer'); // Importing the 'multer' npm module
// const upload = multer({ // Creating a new instance of 'multer' to have things get uploaded by the users or the client
//     dest : 'images', // Setting up the destination of the files to upload which is automatically created when we specify the destination like this
//     limits:{    // Used for putting limits or restrictions on the stuff that can be uploaded
//         fileSize: 1000000      // This equals to '1mb' as 1mb = 1000000 bits , the 'fileSize' property within the 'limits' object literal limits the size of the file that can be uploaded by the client or the user
//     }, 
//     fileFilter(req,file,cb){   // Used to 'Filter' down the types of files that the user or client can upload to the url , the 'file' parameter passed in will contain all the information about the 'file' that the user is trying to upload to this url and the 'cb' or the callback function is called when the upload done by the user is in the correct format or consents with all the validation that we enumerate or an error occurs which could be the reason of invalid upload type or some other validation that might fail
//         if(!file.originalname.match(/\.(doc|docx)$/)){ // Here we are taking the original name of the file which is stored in the 'originalname' property within the 'file' object which is passed as a paramter and then we use the 'match(...)' function which allows us to use regular expression within it and we are typing \.(doc | docx)$ ,within '/.../', which basically checks if the file originalname has the extension .doc or .docx the '.' symbol after the '\' symbol will be searched and once found , the next part of the check would be to check whether they END , which is represented by '$' ,  with the name or extension '.doc' or '.docx'
//             return cb(new Error("Please upload a DOC file"));
//         }
//         cb(undefined,true); // If everything goes well and the file the user wants to upload passes all checks or validation of upload file type and size then we'll just simply call the 'cb' or the callback function with 'undefined' as the first parameter and 'true' as the second parameter stating that everything went fine and just the way it was expected to so accept the upload
//     }
// })

// app.post('/upload', upload.single('upload') , (req,res) => {    // Using the 'post' method of express to allow the client or the user to upload files which requires a middleware provided by the 'multer' npm module via the 'single(...)' method which takes in one parameter which is a string and its basically just the name of the upload which we choosed as 'upload'
//     res.send();
// })

app.use(express.json());

app.use(userRouter);
app.use(tasksRouter);

app.listen(port, () => {
    console.log("Server is up and running on port " + port);  
})

// Demo for using the 'jsonwebtoken' which would help us to truely build the login and sign up functionality by making the routes that we have either public or private based on our preference
// const jwt = require('jsonwebtoken');

// const myfunction = async () => {
//     const token = await jwt.sign({_id : "abc123"}, "thisisarandomstring");
//     console.log(token);

//     const data = jwt.verify(token,"thisisarandomstring");
//     console.log(data); 
// }
// myfunction();


// // Demo for Using the bcryptjs or the bcrypt  algorithm to hash our passwords that the user might input
// const bcrypt = require('bcryptjs');

// const myfunction = async () =>{ // Using the async/await functionality as the bcrypt algorithm returns a promise , to return a password inputted by the user
//     const password = "Red12345!";
//     const hashedPassword = await bcrypt.hash(password,8);  // Running the algorithm '8' times to hash our password value 
    

//     const isMatch = await bcrypt.compare('Red12345!',hashedPassword);   // Comparing the hashsed password to the password that we manually input by using the compare method of the bcrypt algorithm or the 'bcryptjs' npm module 
//     console.log(isMatch);
// }
// myfunction();


// // Demo for using the 'toJSON()' method 
// const pet = {   // Creating an object literal
//     name : "SidBetPapMumBab"
// }

// pet.toJSON = function () {  // Overriding the 'toJSON()' function or method to modify or change the value of the 'object - literal' and what is returned when the 'JSON.stringify(...)' method is called
//     console.log(this);
//     return this;
// }

// console.log(JSON.stringify(pet));   // Calling the 'JSON.stringify(...)' method on an objet literal whose value is recieved form the 'toJSON()' function which is automatiacally called when this 'JSON.stringify(...)' method is called


// Learning how to set up a relationship between the 'user' an the 'task' model 
// const tasks =  require('./models/tasks');
// const main = async () => {
//     const task = await tasks.findById('63dddd276e8f7e168d7368d3');
//     await task.populate('owner').execPopulate();    // This populate method by mongoose goes ahead and finds the user who is associated with the task and sets the value or the 'owner' property or field to that 'user' object or essentially wiht this method we can know the 'user' who created this 'task'
//     console.log(task.owner);
// }

// const main = async () =>{
//     const user = await User.findById('63dd45d30d1c120da248bf96');   // This will return the 'User' and store it into the constant 'user'
//     await user.populate('tasks').execPopulate(); // Using the populate method on the instance of a 'User' we would be able to populate or essentially print all the tasks created by that user with the help of the virtual property i.e 'tasks' which we have created in the 'user.js' model or file under the 'models' folder
//     console.log(user.tasks);    // Here we are printing the populated tasks that the user has created to the console
// }

//  main();