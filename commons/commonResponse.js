var commonResponse = {};

commonResponse.noAccessKey = function(res) {
    res.status(401).json({
        status: "ERROR",
        result: "Access-Key in header is required."
    })
}

commonResponse.noUser = function(res) {
    res.status(401).json({
        status: "ERROR",
        result: "User does not exist."
    });
}

commonResponse.Ok = function(res, result) {
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

commonResponse.Error = function(res) {
    res.status(500).json({
        status: "ERROR"
    })
}

module.exports = commonResponse;