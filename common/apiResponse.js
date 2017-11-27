var apiResponse = {};

apiResponse.accessKeyRequired = function(res) {
    res.status(401).json({
        status: "ERROR",
        result: "Access-Key in header is required."
    })
}

module.exports = apiResponse;