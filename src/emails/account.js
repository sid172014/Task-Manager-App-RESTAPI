// The below method doesn't work now for sending emails

// const mailgun = require('mailgun.js'); // Using the 'mailGun' npm module to send email to our clients

// const apiKey = '0dbbdc3d46e10fe3c2e057ff63bf9564-7764770b-5a11a2c7';    // The api key is to be stored here which we'll get from the mailgun website itself
// const domain = 'sandboxb90e86004f6e4dd89ea3867d82953d27.mailgun.org';   // The domain name can be found inside the 'mailgun' website under the 'Sending' section which will have another section named 'Domains'

// const mg = mailgun({apiKey: apiKey, domain:domain});    // Using the 'mailgun' function to pass in the 'API' key and the 'Domain' name

// // const data = {  // Defining a 'data' object literal which will contain the information about the recipent , sender and the message to be sent with 'subject' and 'text'
// // 	from: 'Excited User <me@samples.mailgun.org>',
// // 	to: 'sidforbusiness172001@egmail.com',
// // 	subject: 'Hello',   
// // 	text: 'We\'re about to roll out Sir!'
// // };
// // mg.messages().send(data, function (error, body) {   // Using the 'messages().send(...)' method to fire off or trigger or send the email to the recipent
// //     console.log(body);
// // });

// const data = {
// 	from: 'Excited User <sidforbusiness172001@gmail.com>',
// 	to: 'sidforbusiness172001@gmail.com',
// 	subject: 'Hello',
// 	text: 'Testing some Mailgun awesomness!'
// };
// mg.messages().send(data, function (error, body) {

// });


// Using 'NodeMailer' npm module to send emails 

const nodemailer = require('nodemailer');	// Importing the 'nodemailer' npm module which we'll use to send emails	

// Setting up the transporter which basically takes in email service we want to use in the format we have mentioned below (in case if it's gmail) 
let transporter = nodemailer.createTransport({
	service : 'gmail',	// Here we are using 'gmail' as the service provider
	host : 'smtp.gmail.com',	// Configuring the host of the 'gmail' authentic website
	secure : false,	// This is a mandatory property	
	auth: {	// Giving the 'auth' object literal which contains the user Email-Id and the 'APP-PASSWORD' of that Email account
		user : process.env.USER_EMAIL,	// Provide 'sender' email id from here
		pass : 'lftrdoutvuiwmpod'	// Providing the APP password for the above 'sender' email id and we can also create new APP-PASSWORDS by going to our google account and then searching for 'app passwords' in the search bar
	},
})

const sendWelcomeEmail = async (email, name) => {	// This function will actually trigger or initiate the mail to be sent
	try{	
		let info = await transporter.sendMail({	// Defining an object literal 'info' which using the 'transporter.sendMail(...)' function to provide all the essential stuff like 'from', 'to', 'subject', 'text' to send the mail
			from : `${process.env.USER_EMAIL}`,	// From email Address
			to : email,	// To email Address
			subject : "Thanks For Joining In!",	// Provide the Subject of the mail to be sent
			text : `Welcome to the app, ${name}. Let me know how you get along with the app.`,	// Provide the Plain Text Body (in case if the 'html' body doesn't work) of the mail to be sent
			html : `<h1>Welcome to the app, ${name}. Let me know how you get along with the app.</h1>`	// Providing the 'html' body which will be sent to the 'reciever' 
		})	
		console.log(info.messageId);	// Printing the 'messageId' of the email to be sent

	}catch(error){
		console.log(error);
	}
}


const sendCancellationEmail = async (email,name) =>{	// Sending a mail when the user or the client side deletes their account , the structure is similar to the one above this which is 'sendWelcomeEmail'
	try{
		let info = await transporter.sendMail({
			from : `${process.env.USER_EMAIL}`,
			to : email,
			subject : "We're sorry to see you go ....",
			text : `${name}, we are deeply saddened by your departure , please let us know what we could have done better to establish a long term relationship with you..`,
			html : `<h1>${name}, we are deeply saddened by your departure , please let us know what we could have done better to establish a long term relationship with you..</h1>`
		})
		console.log(info.messageId);
	}catch(error){
		console.log(error);
	}
}

module.exports = {
	sendWelcomeEmail : sendWelcomeEmail,
	sendCancellationEmail : sendCancellationEmail
}