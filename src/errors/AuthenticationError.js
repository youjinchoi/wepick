class AuthenticationError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, AuthenticationError);
	}
}

module.exports = AuthenticationError;