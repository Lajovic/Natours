const User = require('./../model/userModel')
const crudHandler = require('./../business/crudHandlerBusiness')
const uploadFiles = require('./../config/upload')
const path = require('path')
const { asyncCatcher } = require('./errController')
const { cropAndSaveJPEG } = require('./../business/helpersBusiness')

exports.uploadUserPhoto = uploadFiles.single('photo')

exports.processUserPhoto = asyncCatcher(async (req, res, next) => {
	if (!req.file) return next()

	const image = req.file.buffer
	const fullFileName = `user-${req.user.id}-${Date.now()}.jpeg`
	const destPathAndFileName = path.resolve(__dirname, '..', 'public', 'img', 'users', fullFileName)
	const imgSize = [500, 500]

	cropAndSaveJPEG(image, destPathAndFileName, imgSize)
	req.file.filename = fullFileName
	next()
})

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id
	next()
}

exports.getAll = crudHandler.getAll(User)
exports.getOne = crudHandler.getOne(User)
exports.update = crudHandler.update(User)
exports.delete = crudHandler.deleteOne(User)
