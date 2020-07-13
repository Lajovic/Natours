const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./../routes/reviewRoutes')

const router = express.Router()

router.use('/:tourId/reviews', reviewRouter) // nested route

router
	.route('/')
	.get(tourController.getAll)
	.post(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.create
	)

router
	.route('/top-5-cheap') // tem de ficar acima da rota de :id
	.get(tourController.aliasTop5cheap, tourController.getAll)

router.route('/tourStats').get(tourController.getTourStats)

// Abaixo é um outro jeito de escrever "within?distance=344&center=-40,34.56&unit=km"
router
	.route('/within/:distance/center/:latlng/unit/:unit') // Porém será /within/344/center/-40,34.56/unit/km
	.get(tourController.getTourWithin)

router
	.route('/distances/:latlng/unit/:unit')
	.get(tourController.getDistances)

router
	.route('/:id') // Tem de ficar por último, porque qualquer rota aqui vira variável
	.get(tourController.getOne)
	.patch(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.processTourImages,
		tourController.update
	)
	.delete(
		authController.protect,
		authController.restrictTo('admin', 'lead-guide'),
		tourController.delete
	)

module.exports = router
