const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { getDate } = require('../business/helpersBusiness')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A user must have a name.'],
		minlength: [
			3,
			'The username must have between 3 to 40 characters.',
		],
		maxlength: [
			40,
			'The username must have between 3 to 40 characters.',
		],
		trim: true,
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'A user must have a email.'],
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email'],
	},
	photo: {
		type: String,
		default: 'default.jpg'
	},
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			// Validate only works for create and save, not for update and others.
			validator: function (pwConfirm) {
				return pwConfirm === this.password
			},
			message: 'Passwords are not the same',
		},
	},
	passwordChangedDate: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: Boolean,
		default: true,
		select: false,
	},
})
userSchema.pre('save', async function (next) {
	// só roda se o password tiver sido modificado
	if (this.isModified('password')) {
		const custoProcessamen = 12
		this.password = await bcrypt.hash(this.password, custoProcessamen)
		this.passwordConfirm = null // não precisamos mais desse campo
		next()
	}
})
userSchema.pre('save', async function (next) {
	// só roda se o password tiver sido modificado
	if (!this.isModified('password') || this.isNew) return next()
	this.passwordChangedDate = getDate(-1000) // -1000ms Pra ter ctza de que não entrará em conflito com a data de criação do token
	next()
})
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } })
	next()
})
userSchema.methods.hasChangedPasswordAfter = function (date) {
	if (this.passwordChangedDate) {
		const passwordChangedDate = parseInt(
			this.passwordChangedDate.getTime() / 1000,
			10
		)
		return passwordChangedDate > date
	}
	return false
}
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex')
	const encryptedToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex')
	this.passwordResetToken = encryptedToken
	this.passwordResetExpires = getDate(10 * 60 * 1000) //conversion to miliseconds
	return resetToken
}

module.exports = mongoose.model('User', userSchema)
