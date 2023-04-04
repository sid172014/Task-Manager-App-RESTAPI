// This file is for defining the authentication middleware that we'll use to verify tokens to authenticate users 
const jwt = require('jsonwebtoken'); // Importing the 'jsonwebtoken' npm module  
const User = require('../models/user'); // Importing the 'User' model that we have created


const auth = async (req,res,next) => {  // Using this async function to authenticate users
    try{
        const token = req.header('Authorization').replace('Bearer ','');    // Extracting the 'token' value returned from the 'HTTP' header request made by the user and then get key says 'Authorization' and has a 'value' of 'Bearer rqwer1q2r4e12.....' and replae the 'Bearer ' string to just get the value of the 'Authorization' key 
        const decoded = jwt.verify(token,process.env.JWT_SECRET);    // Verifying the token with that secret value (in this case it is 'thisisarandomstring') that we used to create that token using the 'jsonwebtokens' npm module
        const user = await User.findOne({_id : decoded._id , 'tokens.token' : token}); // Using the 'findOne(...)' function to find a user which has id as 'decoded_.id' and a token value of 'token' inside the 'tokens.token' object literal    

        if(!user){
            throw new Error()   // Throwing error if no such user exist with that 'token' id and the token value;
        }
        
        req.user = user;    // Since we will be using the 'findOne(...)' function to fetch this user that we just fetched and authenticated we will set the 'req.user' value to 'user' variable which has our user so we don't have to search for the user again in the router function.
        req.token = token; // This is done to let the user log out of the specific device he wants to as every login will have it's own 'token' generated so we set the 'req.token' value of the HTTP request coming from the server to the 'token' value which was generated specific to the device which was used for login
       
        next(); // Executing the 'next()' function to let the HTTP request made by the user perform the task it wants to
    }catch(e){      // If the user provides an invalid token then we'll run the catch function
        res.status(401).send({
            error : "Please authenticate correctly"
        })
    }
}

module.exports = auth;