const express = require('express')
const viewController = require('./../controllers/viewController')
const authController = require('./../controllers/authController')
const bookingController = require('./../controllers/bookingController')

const router = express.Router()

router.get(
	'/',
	// bookingController.createBookingCheckout, // Temporário para testar pagamentos sem precisar da aplicação hospedada
	authController.isLoggedIn,
	viewController.getOverview
)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.getLogin)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/my-tours', authController.protect, viewController.getMyTours)

// Para uso sem API
// router.post('/submit-user-data', authController.protect, viewController.updateUserData)

module.exports = router
