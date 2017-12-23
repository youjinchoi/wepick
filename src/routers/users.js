var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');
var InvalidParameterError = require('../errors/InvalidParameterError');

router.delete('/remove-history/:userSeq', function(req, res, next) {
	console.log('remove user history', req.params.userSeq);
	var serverKey = req.get('Server-Key');
	if (!serverKey) {
		throw new InvalidParameterError('Server-Key is required.');
	}
	
	var userSeq = req.params.userSeq;
	if (!userSeq) {
		throw new Error();
	}
	
	User.findOne({'seq': userSeq})
	.then(user => {
		if (user) {
			throw new Error('User still exists.');
		}
		return Question.remove({'questioner': userSeq});
	})
	.then(() => {
		return Answer.remove({'questioner': userSeq});
	})
	.then(() => {
		commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = router;