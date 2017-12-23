class InvalidParameter extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, InvalidParameter);
	}
}

module.exports = InvalidParameter;