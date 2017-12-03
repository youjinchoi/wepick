class NoAccessKeyError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, NoAccessKeyError);
	}
}

module.exports = NoAccessKeyError;