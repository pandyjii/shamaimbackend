
const { response } = require('express');
const nodemailer = require('nodemailer');


// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: '	susana.nitzsche18@ethereal.email',
      pass: 'q6PVb6e4KDjzF5W3J3'
  }
});
  
// API endpoint to send email
exports.contacts= (req, res) => {
  const { to, subject, text } = req.body;
  console.log("hii");
  const mailOptions = {
    from: 'sp2002p@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send(response);
    }
  });


}