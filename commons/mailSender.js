var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'youremail@gmail.com',
		pass: 'yourpassword'
	}
});

mailSender.sendVerificationCode = function(address, code, callback) {
	var mailOptions = mailSender.getVerificationMailOptions(address, code);
	transporter.sendMail(mailOptions, function(error, info){
		callback(error, info);
	});
}

mailSender.getVerificationMailOptions = function(address, code) {
	return {
		from: 'youremail@gmail.com',
		to: address,
		subject: 'Verification Code from Wepick!',
		text: 'Verification Code : ' + code
	}
}

commonResponse.Error = function(res, message) {
    res.status(500).json({
        status: "ERROR",
        result: message || "internal server error"
    })
}

module.exports = mailSender;