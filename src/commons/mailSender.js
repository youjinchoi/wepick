var nodemailer = require('nodemailer');
var vars = require('../../config/vars');
var mailSender = {};

var transporter = nodemailer.createTransport(vars.smptTransport);

mailSender.sendVerificationCode = function(address, code, lang) {
	var mailOptions = mailSender.getVerificationMailOptions(address, code, lang);
	return transporter.sendMail(mailOptions);
}

mailSender.sendQuestionDeleteNofi = function(address, question) {
	var mailOptions = mailSender.getQuestionDeleteNotiMailOptions(address, question);
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

mailSender.getQuestionDeleteNotiMailOptions = function(address, question) {
	var questionOptions = "";
	question.options.map(option => {
		questionOptions = questionOptions + option.value + "\n";
	});
	return {
		from: vars.email.address,
		to: address,
		subject: '[같이 판단]질문 노출 제한 처리 안내',
		text: '안녕하세요, "같이 판단" 서비스팀입니다.'
			+ '\n회원님이 등록하신 질문이 "같이 판단"의 운영 원칙에 부합하지 않은 것으로 판단되어 노출 제한 처리 되었습니다.' 
			+ '\n상세 질문 정보는 아래와 같습니다. 문의사항이 있으실 경우 본 메일에 회신 부탁드립니다.'
			+ '\n\n' + question.contents
			+ '\n\n' + questionOptions
	}
}

module.exports = mailSender;