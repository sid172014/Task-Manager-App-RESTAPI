const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://taskapp:taskappmf@cluster0.fezwscf.mongodb.net/?retryWrites=true&w=majority', {    // Here the mongoose npm module connects with the mongoDB and creates a database named 'task-manager-api'
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify : false,   // Used to avoid the deprecation warning that pops up when we use the 'findByIdAndUpdate(...)' method
    useUnifiedTopology:true 
})



//Practice material for creating new instances from the models we have created until now that is the 'user' and the 'tasks'

// const me = new User({   // Creating a new document for the 'User' collection
//     name : "Sidharth",
//     age : 27
// })

// me.save().then(() => {       // Swaving the 'me' created new model to the 'User' collection of the 'task-manager-api'
//     return console.log(me);
// }).catch((error) => {
//     return console.log(error);
// })


// const mow = new tasks({
//     description : "Mow the freaking Lawn",
//     completed : true
// })

// mow.save().then(() => {
//     return console.log(mow);
// }).catch((error) => {
//     return console.log(error);
// })

// const bet = new User({
//     name : "Betsy",
//     email: "betul@gmail.com",
//     age : 18 
// })
// bet.save().then(() => {
//     return console.log(bet);
// }).catch((error) => {
//     return console.log(error);
// })


// const jos = new User({
//     name : "Joshua Kumar",
//     email: "joshua172001@gmail.com      "
// })

// jos.save().then(()=> {
//     console.log(jos);
// }).catch((error) => {
//     console.log(error);
// })

// User.updateOne({
//     name : "Joshua Kumar"
// },{
//     age : 12
// }, (error,result) => {
//     if(error){
//         console.log(error);
//     }else{
//         console.log(result);
//     }
// })



// const newuser = new User({
//     name: "temp",
//     email : "temp@gmail.com",
//     password: "tempPass           "
// })

// newuser.save().then(() =>{
//     return console.log(newuser);
// }).catch((error) =>  {
//     return console.log(error);
// })

// const anothertask = new tasks({
//     description : "This is a new Description",
    
// })

// anothertask.save().then(() => { 
//     return console.log(anothertask);
// }).catch((error) => {
//     return console.log(error);
// })