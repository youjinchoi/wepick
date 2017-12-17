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
	User.findOne({'email': body.email})
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
		return mailSender.sendVerificationCode(body.email, verification.code, 'ko').then(info => {
			return {verification: verification, info: info};
		});
	})
	.then(data => {
		commonResponse.ok(res, {verificationSeq: data.verification.seq});
	})
	.catch(next);
});
	
router.get('/:verificationSeq/:verificationCode', function(req, res) {
	Verification.findOne({seq: req.params.verificationSeq}, function(error, verification) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		if (!verification) {
			commonResponse.error(res);
			return;
		}
		commonResponse.ok(res, {isVerified: verification.code == req.params.verificationCode});
	})
});	
	
	
module.exports = router;