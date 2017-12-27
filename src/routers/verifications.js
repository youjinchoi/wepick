var express = require('express');
var router = express.Router();
var Verification = require('../models/verification');
var User = require('../models/user');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var util = require('../commons/util');
var mailSender = require('../commons/mailSender');
var DuplicationError = require('../errors/DuplicationError');
var messages = require('../commons/messages');


router.post('/', function(req, res, next) {
	var body = req.body;
	var email = body.email;
	User.findOne({'email': email})
	.then(user => {
		if (user) {
			throw new DuplicationError(messages.DUPLICATE_EMAIL);
		}
		return getNextSeq('verification');
	})
	.then(result => {
		var verification = new Verification();
		verification.seq = result.seq;
		verification.code = util.getRandomNumber(1000, 9999);
		return verification.save().then(() => verification);
	})
	.then(verification => {
		var acceptLang = req.get('Accept-Language');
		console.log('Accept-Language', acceptLang);
		var lang = acceptLang.startsWith('ko') ? 'ko' : 'en';
		return mailSender.sendVerificationCode(email, verification.code, lang).then(info => {
			return {verification: verification, info: info};
		});
	})
	.then(data => {
		if (data.info.accepted && data.info.accepted[0] == email) {
			commonResponse.ok(res, {verificationSeq: data.verification.seq});
		} else {
			console.error(data.info);
			commonResponse.error(res, 'failed to send verification code.');
		}
	})
	.catch(next);
});
	
router.get('/:verificationSeq/:verificationCode', function(req, res, next) {
	Verification.findOne({seq: req.params.verificationSeq})
	.then(verification => {
		if (!verification) {
			throw new Error('Verification not found.');
		}
		commonResponse.ok(res, {isVerified: verification.code == req.params.verificationCode});
	}).catch(next);
});
	
	
module.exports = router;