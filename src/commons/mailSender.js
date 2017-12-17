var nodemailer = require('nodemailer');
var vars = require('../../config/vars');
var mailSender = {};

var transporter = nodemailer.createTransport(vars.smptTransport);

mailSender.sendVerificationCode = function(address, code, lang) {
	var mailOptions = mailSender.getVerificationMailOptions(address, code, lang);
	return transporter.sendMail(mailOptions);
}

mailSender.getVerificationMailOptions = function(address, code, lang) {
	if (lang == 'ko') {
		return {
			from: vars.email.address,
			to: address,
			subject: '"같이 판단"의 인증코드입니다.',
			text: '인증 코드란에 아래 번호를 입력해 주세요.\n' + code
		}
	} else {
		return {
			from: vars.email.address,
			to: address,
			subject: 'Verification Code from Decision.',
			text: 'Verification Code : ' + code
		}
	}
}

module.exports = mailSender;