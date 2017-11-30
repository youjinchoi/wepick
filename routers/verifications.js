var express = require('express');
var router = express.Router();
var Verification = require('../models/verification');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var util = require('../commons/util');
var mailSender = require('../commons/mailSender');


router.post('/', function(req, res) {
	var body = req.body;
	getNextSeq('verification').then(result => {
		if (!result) {
			commonResponse.error(res);
			return;
		}
		var verification = new Verification();
		verification.seq = result.seq;
		verification.code = util.getRandomNumber(1000, 9999);
		verification.save(function(error) {
			if (error) {
				commonResponse.error(res);
				return;
			}
			mailSender.sendVerificationCode(body.email, verification.code, 
				function(error, info) {
					if (error) {
						console.error(error);
						commonResponse.error(res);
						return;
					}
					console.debug(info);
					commonResponse.ok(res, {verificationSeq: verification.seq});
				}
			)
		})
	});
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