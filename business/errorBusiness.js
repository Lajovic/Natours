const mongoose = require('mongoose')

class AppError extends Error {
	constructor(message, statusCode) {
		super()
		this.message = message
		this.statusCode = statusCode
		this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error'
		this.isExpected = true
		Error.captureStackTrace(this, this.constructor)
	}
}

const setCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`
	return new AppError(message, 400)
}

const setDuplicateKeyErrorDB = (err) => {
	const duplicatedField = Object.keys(err.keyValue)[0]
	const duplicatedValue = err.keyValue[duplicatedField]
	const message = `Duplicate ${duplicatedField}: "${duplicatedValue}", please choose another one.`
	return new AppError(message, 400)
}

const setValidationErrorDB = (err) => {
	const message = Object.values(err.errors).map((el) => el.properties.message)
	return new AppError(`${message.join(' ')}`, 400)
}

const setJwtError = () => {
	const message = 'Invalid token. Please log in again.'
	return new AppError(message, 401)
}

const setExpiredJwtError = () => {
	const message = 'Expired token. Please log in again.'
	return new AppError(message, 401)
}

const handleOperationalErrors = (err) => {
	let error = { ...err }

	const isCastError = err instanceof mongoose.Error.CastError
	if (isCastError) error = setCastErrorDB(error)

	if (+err.code === 11000) error = setDuplicateKeyErrorDB(error) // 11000 é o código de erro pra key duplicada do mongo

	const isValidationError = err instanceof mongoose.Error.ValidationError
	if (isValidationError) error = setValidationErrorDB(error)

	if (err.name === 'JsonWebTokenError') error = setJwtError()

	if (err.name === 'TokenExpiredError') error = setExpiredJwtError()

	return error
}

const apiErrorHandler = (err, res) => {
	const error = handleOperationalErrors(err)
	if (error.isExpected)
		return res.status(error.statusCode).json({
			status: error.status,
			message: error.message,
		})
	
	console.error('ERROR!!', err)
	res.status(500).json({
		status: 'error',
		message: 'Something went wrong',
	})
}

const userHandlerError = (err, res) => {
	const error = handleOperationalErrors(err)
	if (error.isExpected)
		return res.status(error.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: error.message,
		})

	console.error('ERROR!!', err)
	res.status(500).render('error', {
		title: 'Something went wrong!',
		msg: 'Looks like something went wrong. Please try again later.',
	})
}

const sendErrorDev = (err, req, res) => {
	if (req.originalUrl.startsWith('/api'))
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		})

	console.error('ERROR!!', err)
	res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: err.message,
	})
}

const sendErrorProd = (err, req, res) => {
	const isErrorApiRelated = req.originalUrl.startsWith('/api')
	isErrorApiRelated ? apiErrorHandler(err, res) : userHandlerError(err, res)
}

exports.AppError = AppError

exports.errorHandler = (err, req, res) => {
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res)
	} else if (process.env.NODE_ENV === 'production') {
		sendErrorProd(err, req, res)
	}
}
