var commonResponse = {};

commonResponse.noAccessKey = function(res) {
    res.status(401).json({
        status: "ERROR",
        result: "Access-Key in header is required."
    })
}

commonResponse.noUser = function(res, message) {
    res.status(401).json({
        status: "ERROR",
        result: message || "User does not exist."
    });
}

commonResponse.ok = function(res, result) {
    if (result) {
        res.json({
            status: "OK",
            result: result
        });
    } else {
        res.json({
            status: "OK"
        });
    }
}

commonResponse.error = function(res, message) {
    res.status(500).json({
        status: "ERROR",
        result: message || "internal server error"
    })
}

module.exports = commonResponse;