var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var commonResponse = require('../commons/commonResponse');
var NoUserError = require('../errors/NoUserError');
var AuthenticationError = require('../errors/AuthenticationError');
var messages = require('../commons/messages');

router.post('/', function(req, res, next) {
	var body = req.body;
	if (!body.email) {
		commonResponse.error(res, "email is required.");
		return;
	}
	if (!body.password) {
		commonResponse.error(res, "password is required.");
		return;
	}
	User.findOne({'email': body.email})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		var password = crypto.createHash('sha256').update(body.password).digest('hex');
		if (user.password != password) {
			throw new AuthenticationError(messages.INVALID_PASSWORD);
		}
		var newAccessKey = crypto.createHash('sha256').update(user.email + new Date().getTime().toString()).digest('hex');
		return User.findByIdAndUpdate(user.id, {$set: {'accessKey': newAccessKey}}, {new: true});
	}).then(user => {
		if (!user) {
			throw new Error();
		}
		commonResponse.ok(res, {accessKey: user.accessKey});
	})
	.catch(next);
});

module.exports = router;