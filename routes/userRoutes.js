const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router
	.route('/password')
	.post(authController.recoverPassword)
	.patch(authController.protect, authController.updatePassword)
router.route('/password/:token').patch(authController.resetPassword)

router.use(authController.protect)

router
	.route('/me')
	.get(userController.getMe, userController.getOne)
	.patch(userController.uploadUserPhoto, userController.processUserPhoto, authController.updateMe) 
	.delete(authController.deleteMe)

router.use(authController.restrictTo('admin'))

router.route('/').get(userController.getAll)

router
	.route('/:id')
	.get(userController.getOne)
	.patch(userController.update)
	.delete(userController.delete)

module.exports = router
