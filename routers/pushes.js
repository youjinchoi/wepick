var express = require('express');
var router = express.Router();
var User = require('../models/user');
var commonResponse = require('../commons/commonResponse');

router.put('/tokens', function(req, res){
	var accessKey = req.get('Access-Key');
	if (!accessKey) {
		commonResponse.noAccessKey(res);
		return;
	}
	User.findOne({'accessKey': accessKey}, function(error, user) {
		if (error) {
			commonResponse.error(res);
			return;
		}
		if (!user) {
			commonResponse.noUser(res);
			return;
		}
		user.update({$set: {'pushToken': req.body.token}}, function(error) {
			if (error) {
				commonResponse.error(res);
				return;
			}
			commonResponse.ok(res);
		});
	})
});

module.exports = router;