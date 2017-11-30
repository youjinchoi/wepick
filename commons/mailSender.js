var nodemailer = require('nodemailer');
var config = require('../config');
var mailSender = {};

var transporter = nodemailer.createTransport(config.smptTransport);

mailSender.sendVerificationCode = function(address, code, callback) {
	var mailOptions = mailSender.getVerificationMailOptions(address, code);
	transporter.sendMail(mailOptions, function(error, info){
		callback(error, info);
	});
}

mailSender.getVerificationMailOptions = function(address, code) {
	return {
		from: config.email.address,
		to: address,
		subject: 'Verification Code from Wepick!',
		text: 'Verification Code : ' + code
	}
}

module.exports = mailSender;