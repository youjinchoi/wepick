var express = require('express');
var router = express.Router();
var User = require('../models/user');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');
var pushSender = require('../commons/pushSender');

router.post('/:userSeq', function(req, res, next) {
	User.findOne({'seq': req.params.userSeq})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		if (!user.pushToken) {
			throw new Error('push token이 없습니다.');
		}
		
		return pushSender.sendMessage(user.pushToken)
	})
	.then(result => {
		console.log('production', result);
		commonResponse.ok(res);
	})
	.catch(next);
})

router.put('/tokens', function(req, res, next){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		throw new NoAccessKeyError(messages.NO_ACCESS_KEY);
	}
	
	User.findOne({'accessKey': accessKey})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		return user.update({$set: {'pushToken': req.body.token}})
	})
	.then(() => {
		return commonResponse.ok(res);
	})
	.catch(next);
});

module.exports = router;