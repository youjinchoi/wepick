var messages = require('./messages');

var commonResponse = {};

commonResponse.noAccessKey = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
        	code: 1001,
        	message: message || messages.NO_ACCESS_KEY
        }
    })
}

commonResponse.noUser = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
        	code: 1002,
        	message: message || messages.NO_USER
        }
    });
}

commonResponse.authentication = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
            code: 1003,
            message: message || messages.AUTHENTICATION
        }
    });
}

commonResponse.duplication = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
            code: 1004,
            message: message || messages.DUPLICATION
        }
    });
}

commonResponse.emailNotFound = function(res, message) {
    return res.status(401).json({
        status: "ERROR",
        result: {
            code: 1005,
            message: message || messages.EMAIL_NOT_FOUND
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
        result: {
            code: 9001,
            message: message || messages.SERVER_ERROR
        }
    })
}

module.exports = commonResponse;