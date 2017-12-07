var express = require('express');
var router = express.Router();
var User = require('../models/user');
var commonResponse = require('../commons/commonResponse');
var NoAccessKeyError = require('../errors/NoAccessKeyError');
var NoUserError = require('../errors/NoUserError');
var messages = require('../commons/messages');
var apn = require('apn');
var adhocPushOptions = {
	token: {
		key: "WePick_Push.p8",
		keyId: "BW3ENMPXLE",
		teamId: "DZWKTL8AW8"
	},
	production: false
};

var productionPushOptions = {
	token: {
		key: "WePick_Push.p8",
		keyId: "BW3ENMPXLE",
		teamId: "DZWKTL8AW8"
	},
	production: true
};
var note = new apn.Notification();
note.alert = {'loc-key' : 'test_loc_key', 'loc-args' : 'test_loc_args'};
note.topic = 'com.Waak.WePick';
note.contentAvailable = 1;

var adhocApnProvider = new apn.Provider(adhocPushOptions);
var productionApnProvider = new apn.Provider(productionPushOptions);

router.post('/:userSeq', function(req, res, next) {
	User.findOne({'seq': req.params.userSeq})
	.then(user => {
		if (!user) {
			throw new NoUserError(messages.NO_USER);
		}
		if (!user.pushToken) {
			throw new Error('push token이 없습니다.');
		}

		adhocApnProvider.send(note, user.pushToken).then(result => {
			console.log('adhoc', result);
			commonResponse.ok(res);
		});

		productionApnProvider.send(note, user.pushToken).then(result => {
			console.log('production', result);
			commonResponse.ok(res);
		});
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