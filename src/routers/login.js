var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var commonResponse = require('../commons/commonResponse');

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
			commonResponse.noUser(res);
			return;
		}
		var password = crypto.createHash('sha256').update(body.password).digest('hex');
		if (user.password != password) {
			commonResponse.error(res, "invalid password.");
			return;
		}
		var newAccessKey = crypto.createHash('sha256').update(user.email + new Date().getTime().toString()).digest('hex');
		user.accessKey = newAccessKey;
		return user.save();
	}).then(user => {
		if (!user) {
			commonResponse.error(res);
			return;
		}
		commonResponse.ok(res, {accessKey: user.accessKey});
	})
	.catch(next);
});

module.exports = router;