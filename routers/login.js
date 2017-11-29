var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var commonResponse = require('../commons/commonResponse');

router.post('/', function(req, res) {
	var body = req.body;
	User.findOne({'email': body.email}, function(error, data) {
		if (error) {
			console.log(error);
			commonResponse.Error(res);
			return;
		}
		
		if (!data) {
			commonResponse.noUser(res, "email does not exists.");
			return;
		}

		var password = crypto.createHash('sha256').update(body.password).digest('hex');
		if (data.password != password) {
			commonResponse.Error(res, "invalid password.");
			return;
		}
		commonResponse.Ok(res, {accessKey: data.accessKey});
	})
});

module.exports = router;