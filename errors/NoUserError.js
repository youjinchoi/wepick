class NoUserError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, NoUserError);
	}
}

module.exports = NoUserError;