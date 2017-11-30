var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

var GUEST = 1;

router.post('/', function(req, res) {
	getNextSeq('user').then(result => {
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		var user = new User();
		user.seq = result.seq;
		user.type = GUEST;
		user.accessKey = accessKey;
		user.save(function(error) {
			if (error) {
				console.error(error);
				commonResponse.error(res);
				return;
			}
			commonResponse.ok(res, {accessKey: accessKey});
		});
	});
});

module.exports = router;