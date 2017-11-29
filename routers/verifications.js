var express = require('express');
var router = express.Router();
var Verification = require('../models/verification');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');
var mailSender = require('../commons/mailSender');


router.post('/', function(req, res) {
	var body = req.body;
	getNextSeq('verification').then(result => {
		if (!result) {
			commonResponse.Error(res);
			return;
		}
		var verification = new Verification();
		verification.seq = result.seq;
		verification.code = 1111;
		verification.save(function(error) {
			if (error) {
				commonResponse.Error(res);
				return;
			}
			mailSender.sendVerificationCode(body.email, verification.code, 
					function(error, info) {
				if (error) {
					commonResponse.Error(res);
					return;
				}
				commonResponse.Ok(res, {verificationSeq: verification.seq});
			})
		})
	}
});
	
router.get('/:verificationSeq/:verificationCode', function(req, res) {
	Verification.findOne({seq: req.params.verificationSeq}, function(error, verification) {
		if (error) {
			commonResponse.Error(res);
			return;
		}
		if (!verification) {
			commonResponse.Error(res);
			return;
		}
		commonResponse.Ok(res, {isVerified: verification.code == req.params.verificationCode});
	})
});	
	
	
module.exports = router;