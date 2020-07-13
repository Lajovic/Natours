// @ts-nocheck
const authBusiness = require('./../business/authBusiness')
const { getDate } = require('../business/helpersBusiness')
const Email = require('../utils/emailer')
const { throwError, asyncCatcher } = require('./errController')

exports.signUp = asyncCatcher(async (req, res, next) => {
	const user = await authBusiness.createUser(req.body)
	const url = `${req.protocol}://${req.get('host')}/me`
	new Email(user, url).sendWelcome()
	return authBusiness.sendToken(user._id, res, 201)
})

exports.login = asyncCatcher(async (req, res, next) => {
	const { email, password } = req.body

	if (!email || !password) return throwError('Please provide email and password.', 400, next)

	const user = await authBusiness.findUserByEmail(email)
	if (!user) return throwError('Incorrect email or password.', 401, next)

	const isPasswordCorrect = await authBusiness.checkPassword(password, user.password)
	if (!isPasswordCorrect) return throwError('Incorrect email or password.', 401, next)

	authBusiness.sendToken(user._id, req, res, 200)
})

exports.logout = (req, res) => {
	res.cookie('jwt', 'Logged Out', {
		expires: new Date(getDate(10 * 1000)),
		httpOnly: true,
	})
	res.status(200).json({ status: 'success' })
}

exports.protect = asyncCatcher(async (req, res, next) => {
	// Usuário sempre estará logado com cookies, as apis é que acessam via headers.authorization
	const { authorization } = req.headers
	let token = authBusiness.getHeadersJwt(authorization)

	if (!token && req.cookies.jwt) token = req.cookies.jwt

	if (!token) return throwError('Please log in to get access.', 401, next)

	const payload = await authBusiness.getTokenPayload(token)
	if (payload instanceof Error) throwError('Please log in to get access.', 401, next)

	const user = await authBusiness.findUserByID(payload.id)
	if (!user) return throwError('The user does not exist.', 401, next)

	if (user.hasChangedPasswordAfter(payload.iat))
		return throwError('Incorrect email or password.', 401, next)

	req.user = user
	res.locals.user = user // quaisquer variáveis em res.locals estarão disponíveis nos templates pug
	next()
})

exports.isLoggedIn = async (req, res, next) => {
	try {
		const jwt = req.cookies.jwt

		if (!jwt) return next()

		const payload = await authBusiness.getTokenPayload(jwt)
		if (payload instanceof Error) return next()

		const user = await authBusiness.findUserByID(payload.id)
		if (!user) return next()

		if (user.hasChangedPasswordAfter(payload.iat)) return next()

		res.locals.user = user // quaisquer variáveis em res.locals estarão disponíveis nos templates pug
		next()
	} catch (err) {
		next()
	}
}

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			const message = 'You do not have permission to perform this action.'
			return throwError(message, 403, next)
		}
		next()
	}
}

exports.recoverPassword = asyncCatcher(async (req, res, next) => {
	const user = await authBusiness.findUserByEmail(req.body.email)
	if (!user) {
		const message = 'There is no user with this email address.'
		return throwError(message, 404, next)
	}
	const resetToken = user.createPasswordResetToken(user)
	await user.save({ validateBeforeSave: false })

	try {
		const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
		await new Email(user, resetURL).sendPasswordReset()
	} catch (err) {
		user.passwordResetToken = null
		user.passwordResetExpires = null
		await user.save({ validateBeforeSave: false })
		const message = 'There was an error sending the email. Try again later.'
		return throwError(message, 500, next)
	}
	res.status(200).json({
		status: 'success',
		message: 'Recover URL was sent to your email',
	})
})

exports.resetPassword = asyncCatcher(async (req, res, next) => {
	const hashedToken = authBusiness.hashString(req.params.token)
	const user = await authBusiness.findUser({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gte: getDate() },
	})
	if (!user) return throwError('Token is invalid or has expired', 400, next)
	user.password = req.body.password
	user.passwordConfirm = req.body.passwordConfirm
	user.passwordResetToken = null
	user.passwordResetExpires = null
	await user.save()
	return authBusiness.sendToken(user._id, req, res, 200)
})

exports.updatePassword = asyncCatcher(async (req, res, next) => {
	const user = await authBusiness.findUserByID(req.user.id)
	const isPasswordCorrect = await authBusiness.checkPassword(req.body.oldPassword, user.password)
	if (!isPasswordCorrect) return throwError('Incorrect password.', 401, next)

	user.password = req.body.password
	user.passwordConfirm = req.body.passwordConfirm
	await user.save()
	return authBusiness.sendToken(user._id, req, res, 200)
})

exports.updateMe = asyncCatcher(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm) {
		const message = 'For password update, use "/changePassword".'
		return throwError(message, 400, next)
	}
	const updatedUser = await authBusiness.findUserByIdAndUpdate(req)
	res.status(200).json({
		status: 'success',
		requestTime: req.requestTime,
		data: {
			user: updatedUser,
		},
	})
})

exports.deleteMe = asyncCatcher(async (req, res) => {
	await authBusiness.deleteUserByID(req.user.id)
	res.status(204).json({
		status: 'success',
		data: null,
	})
})
