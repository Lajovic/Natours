const express = require('express')
const authController = require('./../controllers/authController')
const reviewController = require('./../controllers/reviewController')

// mergeParams pra nested route conseguir acesso ao :tourId que vem de tourRoutes
const router = express.Router({ mergeParams: true })

router.use(authController.protect)

router
	.route('/')
	.get(reviewController.setSearchFilter, reviewController.getAll)
	.post(
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.create
	)

router
	.route('/:id')
	.get(reviewController.getOne)
	.patch(
		authController.restrictTo('user', 'admin'),
		reviewController.update
	)
	.delete(reviewController.delete)

module.exports = router
