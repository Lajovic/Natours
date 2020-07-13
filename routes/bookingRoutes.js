const express = require('express')
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')

const router = express.Router()

router.use(authController.protect)

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession)

router.use(authController.restrictTo('admin', 'lead-guide'))

router.route('/').get(bookingController.getAll).post(bookingController.create)

router
	.route('/:id')
	.get(bookingController.getOne)
	.patch(bookingController.update)
	.delete(bookingController.delete)

module.exports = router
