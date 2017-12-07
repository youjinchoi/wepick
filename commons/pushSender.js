var apn = require('apn');
var adhocPushOptions = {
	token: {
		key: "/root/wepick/WePick_Push.p8",
		keyId: "BW3ENMPXLE",
		teamId: "DZWKTL8AW8"
	},
	production: false
};

var productionPushOptions = {
	token: {
		key: "/root/wepick/WePick_Push.p8",
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

var pushSender = {};

pushSender.sendMessage = function(token) {
	/*adhocApnProvider.send(note, token).then(result => {
		console.log('adhoc', result);
		callback();
	});*/
	return productionApnProvider.send(note, token);
}

module.exports = pushSender;