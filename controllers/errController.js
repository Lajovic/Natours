const { errorHandler } = require('../business/errorBusiness')
const { AppError } = require('../business/errorBusiness')

exports.globalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500
	err.status = err.status || 'error'
	errorHandler(err, req, res)
}
exports.throwError = (errorMessage, errorCode, next) => {
	if (!next) return new AppError(errorMessage, errorCode)
	next(new AppError(errorMessage, errorCode))
}
exports.asyncCatcher = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next)
	}
}
