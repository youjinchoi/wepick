class DuplicationError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, DuplicationError);
	}
}

module.exports = DuplicationError;