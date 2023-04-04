const express = require('express');
const tasks = require('../models/tasks');   // Importing the 'tasks' model which we have created using mongoose
const auth = require('../middleware/auth');

const router = new express.Router();    // Importing the express router 


// Creating a task by the properties provided by the user in the 'req.body' part of the HTTP request passed by the client WITHOUT AUTHENTICATION
// router.post('/tasks',async (req,res) => {
//     const task = new tasks(req.body);

//     try{
//         await task.save();
//         res.status(201).send(task);
//     }catch (e){
//         res.status(400).send(e);
//     }

//     // task.save().then(() => {
//     //     res.status(201);
//     //     res.send(task);
//     // }).catch((error) => {
//     //     res.status(400);
//     //     res.send(error);
//     // })
// })

// Creating a task WITH AUTHENTICATION 
router.post('/tasks',auth , async (req,res) => {    // The 'auth' variable here is the function provided by the 'auth.js' file under the 'middlewares' folder and it will also authenticate the user and assign the user as 'req.user' and append it to the HTTP request sent by the client for us to access it 
    const task = new tasks({
        ...req.body,    // This is the 'ES6 Spread Operator' which pretty much does the work of filling up the properties and fields which are provided via the HTTP request made by the user 
        owner: req.user._id // This property is something that the user shouldn't provide and it should be set automatically as soon as the user creates a new task and we are doing this with the help of the 'auth' function in the 'auth.js' file under 'middlewares' folder which will append the 'req.user' to the HTTP request made by the user 
    });

    try{
        await task.save();
        res.status(201).send(task);
    }catch (e){
        res.status(400).send(e);
    }

    // task.save().then(() => {
    //     res.status(201);
    //     res.send(task);
    // }).catch((error) => {
    //     res.status(400);
    //     res.send(error);
    // })
})



router.get('/tasks', auth, async (req,res) => {

    const match = {} // Defining an object literal so to use it inside the populate function to get the only documents or the results whose properties match with this 'match' object literal
    const sort = {} // Defining an object literal so to use it inside the populate function to get the documents or the results in a specific sorted order specified by the user


    if(req.query.completed){    // Checking if the url has a query string with key value as 'completed' like '/tasks?completed=true' or '/tasks?completed=false'
        match.completed = req.query.completed === 'true'; // Setting a new property of 'completed' inside the match object literal as the return value of either true when the 'completed' query provided in the url has a value of 'true' or false when the 'completed' query provided in the url has a value of 'false'
    }

    if(req.query.sortBy){   // Checking if the url has a query string with key value as 'sortBy' like '/tasks?sortBy='desc'' or '/tasks?sortBy='asc''        
        const parts = req.query.sortBy.split(':').then((req,res) =>{});  // Using the ':' delimiter to split the string value inside the 'req.query.sortBy' string and setting it to an array which is stored in the 'parts' constant here
        sort[parts[0]] = parts[1] === 'desc' ? -1:1; // Now creating a new property in the 'sory' object literal that will be the first element in the 'parts' array and setting its value to either -1 or 1 based on the whether the first element in the 'parts' array has a string value equal to 'desc' (which sets the sort[parts[0]] value to -1(integer value)) or any other value (which sets the sort[parts[0]] value to 1 (integer value))
    }


    // if(req.query.sortBy){   // For making multiple criteria to sort the results or documents
    //     const parts = req.query.sortBy.split('_');
    //     parts.forEach((element) => {
    //         const another = element.split(':');
    //         if(another[1] === 'true' || another[1] === 'false'){

    //             sort[another[0]] = another[1] === 'false' ? -1:1;
    //         }else{
    //             sort[another[0]] = another[1] === 'desc' ? -1:1;
    //         } 
    //     })

    // }

    try{
        //const task = await tasks.find({owner: req.user._id}); We can use the 'find' function or method provided by mongoose and set one of its 'find' property to 'owner: req.user._id' to get all the tasks that the currently logged in user has made
        
        // Or we can make use of the 'populate' function which makes a virtual proeperty which gets all the tasks created by the user that is currently logged in 
        const user = req.user;
        await user.populate({
            path : 'tasks', // Setting up the path for the populate function to populate , which is the virutal property 'tasks' we have created in the 'user.js' file inside the 'models' directory or folder
            match : match, // Making sure the documents/data which are returned from the populate function match the properties or the criteria which as specified inside the 'match' object literal given above
            options : {
                limit : parseInt(req.query.limit),  // Limits the no of results or documents we are shown from the database by the server
                skip : parseInt(req.query.skip), // Skips the nunber of results or documents provided starting from the first result or document
                sort : sort // This will sort the documnets or the results in 'ascending' or 'descending' order based on the 'sortBy' query string provided and the 'sort' object literal
            }   
        }).execPopulate();
        if(!user.tasks){
            return res.status(404).send();
        }
        res.send(user.tasks);
    }catch(e){
        res.send(500).send(e);
    }

    // tasks.find({}).then((tasks) => {
    //     return res.send(tasks);
    // }).catch((error) => {
    //     res.status(500);
    //     return res.send(error);
    // })
})


router.get('/tasks/:id', auth, async (req,res) => { // Adding in the 'auth' authentication functionality to have the user which is currently logged in
    const _id = req.params.id;
   
    try{
        const find = await tasks.findOne({  // Using the 'findOne()' function by mongoose to search for a task which has the id present in the 'req.params.id' variable and making sure that its 'owner' is the user that is currently logged in and that is why we are using the 'owner' property as well
            _id : _id,
            owner: req.user._id 
        });
        if(!find){
            return res.status(404).send();
        }
        res.send(find);
    }catch (e) {
        res.status(500).send(e);
    }
    // tasks.findById(_id).then((task) => {
    //     if(!task) {
    //         res.status(404);
    //         return res.send();
    //     }
    //     return res.send(task);
    // }).catch((error) => {
    //     res.status(500);
    //     return res.send(error);
    // })
})




router.patch('/tasks/:id' ,auth,  async (req,res) =>{
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['completed'];

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if(!isValidOperation){
        return res.status(400).send({error : "Invalid Update Operation initiated !"})
    }
    try{
        const task = await tasks.findOne({
            _id : req.params.id,
            owner: req.user._id0
        });
        
       //   const task = await tasks.findByIdAndUpdate(_id,req.body,{new : true, runValidators:true})
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update) => {
            task[update] = req.body[update];
        })
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
})



router.delete('/tasks/:id', auth ,async (req, res) =>{    // Deleting a task document from the 'tasks' collection
    const _id = req.params.id;

    try{
        const deletedTask = await tasks.findOneAndDelete({
            _id : _id,
            owner : req.user._id
        });
        if(!deletedTask){
            res.status(404).send();
        }
        res.send(deletedTask);
    }catch (e) {
        res.status(400).send(e);
    }
})
 

module.exports = router;