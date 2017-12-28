class EmailNotFoundError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, EmailNotFoundError);
	}
}

module.exports = EmailNotFoundError;