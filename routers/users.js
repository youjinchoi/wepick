var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');
var commonResponse = require('../commons/commonResponse');

router.get('/@Self', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, data) {
		if (error || !data) {
			commonResponse.noUser(res);
			return;
		}
		commonResponse.Ok(res, data);
	})
})

router.post('/', function(req, res) {
	getNextSeq('user').then(result => {
		var user = new User();
		user.seq = result.seq;
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		user.accessKey = accessKey;
		user.save(function(error) {
			if (error) {
				res.status(500).json({
					status: "ERROR"
				});
				return;
			}
			commonResponse.Ok(res, {accessKey: accessKey});
		});
	});
});

module.exports = router;