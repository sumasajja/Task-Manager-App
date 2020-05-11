const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (name, email) => {
    sgMail.send({
        to:  email,
        from: 'sumasajja123@gmail.com',
        subject: 'Welcome to Task Manager App',
        text: `Hi  ${name} Let us know how  that goes with the app`
    });
}


const sendGoodByeEmail = (name, email) => {
    sgMail.send({
        to:  email,
        from: 'sumasajja123@gmail.com',
        subject: 'Good Bye from Task Manager App',
        text: `Hi ${name}, Let us know how was your experience with the app`
    });
}


module.exports = {
    sendWelcomeEmail,
    sendGoodByeEmail
};

