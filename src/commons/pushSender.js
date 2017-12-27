var apn = require('apn');
var vars = require('../../config/vars');
var productionProvider = new apn.Provider({
	token: vars.pushOptions.token,
	production: true
});
var nonProductionProvider = new apn.Provider({
	token: vars.pushOptions.token,
	production: false
})

var pushSender = {};

pushSender.sendMessage = function(token) {
	return productionProvider.send(note, token);
}

pushSender.sendAnswerToQuestioner = function(token, args, fnSuccess, fnFail) {
	var noti = new apn.Notification();
	noti.topic = 'com.Waak.WePick';
	noti.contentAvailable = 1;
	noti.setTitleLocKey('push_answer_title');
	noti.setTitleLocArgs([args.questionContents, args.answerContents]);
	noti.setLocKey('push_answer_content');
	noti.setLocArgs([args.answerCount.toString(), args.topAnswerContents, args.topAnswerCount.toString()]);
	noti.payload = {'questionSeq': args.questionSeq};

	pushSender.send(noti, token, fnSuccess, fnFail);
}

pushSender.sendFinalAnswerToQuestioner = function(token, args, fnSuccess, fnFail) {
	var noti = new apn.Notification();
	noti.topic = 'com.Waak.WePick';
	noti.contentAvailable = 1;
	noti.sound = 'default';
	noti.setTitleLocKey('push_final_answer_title');
	noti.setTitleLocArgs([args.questionContents, args.topAnswerContents]);
	noti.setLocKey('push_final_answer_content');
	noti.setLocArgs([args.topAnswerCount.toString(), args.maxAnswerCount.toString()]);
	noti.payload = {'questionSeq': args.questionSeq};

	pushSender.send(noti, token, fnSuccess, fnFail);
}

pushSender.send = function(noti, token, fnSuccess, fnFail) {
	productionProvider.send(noti, token)
	.then(result => {
		console.log('productionProvider', result);
		if (pushSender.isSuccess(result)) {
			fnSuccess();
		} else {
			nonProductionProvider.send(noti, token)
			.then(result => {
				console.error('nonProductionProvider', result);
				if (pushSender.isSuccess(result)) {
					fnSuccess();
				} else {
					fnFail();
				}
			});
		}
	});
}

pushSender.isSuccess = function(result) {
	return (result.sent || []).length > 0;
}

module.exports = pushSender;