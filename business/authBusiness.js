const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./../model/userModel')
const { promisify } = require('util')
const crypto = require('crypto')
const { getDate } = require('./helpersBusiness')

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_KEY, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	})
}
const filterFields = (allFields, ...allowedFields) => {
	const filteredFields = {}
	allowedFields.forEach((allowed) => {
		if (Object.keys(allFields).includes(allowed)) filteredFields[allowed] = allFields[allowed]
	})
	return filteredFields
}
exports.createUser = (user) => {
	return User.create({
		name: user.name,
		email: user.email,
		password: user.password,
		passwordConfirm: user.passwordConfirm,
	})
}
exports.findUser = (obj) => {
	return User.findOne(obj)
}
exports.findUserByID = (id) => {
	return User.findById(id).select('+password')
}
exports.findUserByEmail = (email) => {
	return User.findOne({ email }).select('+password')
}
exports.findUserByIdAndUpdate = (req) => {
	const filteredFields = filterFields(req.body, 'name', 'email')
	if (req.file) filteredFields.photo = req.file.filename
	const user = User.findByIdAndUpdate(req.user.id, filteredFields, {
		new: true, // new retorna o novo objeto ao invés do antigo
		runValidators: true,
	})
	return user
}
exports.deleteUserByID = (id) => {
	return User.findByIdAndUpdate(id, { active: false })
}
exports.checkPassword = (candidatePw, userPw) => {
	return bcrypt.compare(candidatePw, userPw)
}
exports.getHeadersJwt = (authorization) => {
	if (authorization && authorization.startsWith('Bearer')) return authorization.split(' ')[1]
}
exports.getTokenPayload = async (token) => {
	try {
		return await promisify(jwt.verify)(token, process.env.JWT_KEY)
	} catch (err) {
		return err
	}
}
exports.sendToken = (id, req, res, statusCode) => {
	const token = signToken(id)
	const daysToExpireInMilisec = process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
	const cookieOptions = {
		expires: new Date(getDate(daysToExpireInMilisec)),
		httpOnly: true,
		secure: req.secure || req.headers['X-Forwarded-Proto'] === 'https', // Caso seja https, use-a
	}
	res.cookie('jwt', token, cookieOptions)
	res.status(statusCode).json({
		status: 'success',
		token,
	})
}
exports.hashString = (str) => {
	return crypto.createHash('sha256').update(str).digest('hex')
}
