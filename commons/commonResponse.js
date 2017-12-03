var messages = require('./messages');

var commonResponse = {};

commonResponse.noAccessKey = function(res) {
    return res.status(401).json({
        status: "ERROR",
        result: {
        	code: 1001,
        	message: messages.NO_ACCESS_KEY
        }
    })
}

commonResponse.noUser = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
        	code: 1002,
        	message: messages.NO_USER
        }
    });
}

commonResponse.ok = function(res, result) {
    if (result) {
        return res.json({
            status: "OK",
            result: result
        });
    } else {
        return res.json({
            status: "OK"
        });
    }
}

commonResponse.error = function(res, message) {
    return res.status(500).json({
        status: "ERROR",
        result: message || "internal server error"
    })
}

module.exports = commonResponse;