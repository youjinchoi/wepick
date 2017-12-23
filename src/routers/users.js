var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Question = require('../models/question');
var Answer = require('../models/answer');
var commonResponse = require('../commons/commonResponse');

router.delete('/remove-history/:userSeq', function(req, res, next) {
	var serverKey = req.get('Server-Key');
	if (!serverKey) {
		commonResponse.error(res);
		return;
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