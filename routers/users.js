var express = require('express');
var router = express.Router();
var User = require('../models/user');
var crypto = require('crypto');
var getNextSeq = require('../autoIncrement');

router.get('/@Self', function(req, res) {
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		res.status(401).json({
			status: "ERROR",
			result: "Access-Key in header is required."
		})
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, data) {
		if (error) {
			res.status(404).json({
				status: "ERROR",
				result: "user does not exist."
			})
			return;
		}
		var apiResponse = {
	            status: "OK",
	            result: data
	        };
		res.json(apiResponse);
	})
})

router.post('/', function(req, res) {
	getNextSeq('user').then(result => {
		var user = new User();
		user.seq = result.seq;
		var accessKey = crypto.createHash('sha256').update(result.seq.toString()).digest('hex');
		user.accessKey = accessKey;
		console.log('add user', user);
		user.save(function(error) {
			if (error) {
				res.status(500).json({
					status: "ERROR"
				});
				return;
			}
			res.json({
	            status: "OK",
	            result: {accessKey: accessKey}
	        });
		});
	});
});

module.exports = router;