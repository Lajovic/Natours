const Tour = require('./../model/tourModel')
const crudHandler = require('./../business/crudHandlerBusiness')
const { asyncCatcher, throwError } = require('./errController')
const uploadFiles = require('./../config/upload')
const { cropAndSaveJPEG } = require('./../business/helpersBusiness')
const path = require('path')

exports.getTourStats = asyncCatcher(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } },
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' },
				numTours: { $sum: 1 },
				numRatings: { $sum: '$ratingsQuantity' },
				avgRating: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' },
			},
		},
		{
			$sort: { avgPrice: 1 },
		},
		{
			$match: { _id: { $ne: 'EASY' } },
		},
	])
	res.status(200).json({
		msgStatus: 'success',
		requestTime: req.requestTime,
		data: {
			stats,
		},
	})
})

exports.aliasTop5cheap = (req, res, next) => {
	req.query.limit = '5'
	req.query.sort = 'price,-rating'
	req.query.fields = 'name,price,difficulty,summary,ratingsAverage'
	next()
}

exports.getTourWithin = asyncCatcher(async (req, res, next) => {
	const { distance, latlng, unit } = req.params
	const [lat, lng] = latlng.split(',')
	if (!lat || !lng) {
		const message = 'Please provide your latitude and longitude'
		return throwError(message, 400, next)
	}
	const EarthRadiusMiles = 3963.2
	const EarthRadiusKm = 6378.1
	const radians = unit === 'mi' ? distance / EarthRadiusMiles : distance / EarthRadiusKm // radians é a distância desejada dividida pelo raio da terra em milhas ou km
	const tours = await Tour.find({
		startLocation: {
			$geoWithin: { $centerSphere: [[lng, lat], radians] },
		},
	})
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			data: tours,
		},
	})
})

exports.getDistances = asyncCatcher(async (req, res, next) => {
	const { latlng, unit } = req.params
	const [lat, lng] = latlng.split(',')

	if (!lat || !lng) {
		const message = 'Please provide your latitude and longitude'
		return throwError(message, 400, next)
	}
	const meterToKmMultiplier = 0.001
	const meterToMilesMultiplier = 0.000621371
	const multiplier = unit === 'mi' ? meterToMilesMultiplier : meterToKmMultiplier
	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: 'Point',
					coordinates: [lng * 1, lat * 1],
				},
				distanceField: 'distance',
				distanceMultiplier: multiplier,
			},
		},
		{
			$project: {
				distance: 1,
				name: 1,
			},
		},
	])
	res.status(200).json({
		status: 'success',
		data: {
			data: distances,
		},
	})
})

// upfiles.single('clientFieldName') é pra um arquivo. Produz req.file (no singular)
// upfiles.array('clientFieldSName', 3) é pra vários arquivos com o mesmo nome no field. Produz req.files (no plural)
// upfiles.fields é pra vários arquivos com nomes de fields diferentes. A prop maxCount define a quantidade máxima de arq aceitos. Produz req.files (no plural)
exports.uploadTourImages = uploadFiles.fields([
	{ name: 'imageCover', maxCount: 1 }, // Definimos o tour schema para aceitar 1 img como cover e um array de outras imgs
	{ name: 'images', maxCount: 3 },
])

exports.processTourImages = asyncCatcher(async (req, res, next) => {
	if (!req.files.imageCover || !req.files.images) return next()
	
	const destinationPath = path.resolve(__dirname, '..', 'public', 'img', 'tours')
	const imgSize = [2000, 1333]

	const imgCoverFileName = `tour-imageCover-${req.params.id}-${Date.now()}.jpeg`
	const imgCoverFullFileName = path.resolve(destinationPath, imgCoverFileName)

	cropAndSaveJPEG(req.files.imageCover[0].buffer, imgCoverFullFileName, imgSize)

	req.body.imageCover = imgCoverFileName
	req.body.images = []

	req.files.images.forEach((file, i) => {
		const imgFileName = `tour-image-${i + 1}-${req.params.id}-${Date.now()}.jpeg`
		const imgFullFileName = path.resolve(destinationPath, imgFileName)
		cropAndSaveJPEG(req.files.images[i].buffer, imgFullFileName, imgSize)
		req.body.images.push(imgFileName)
	})

	// const images = { ...req.files.images }
	// console.log(images)

	next()
})

exports.create = crudHandler.create(Tour)
exports.getAll = crudHandler.getAll(Tour)
exports.getOne = crudHandler.getOne(Tour, { path: 'reviews' })
exports.update = crudHandler.update(Tour)
exports.delete = crudHandler.deleteOne(Tour)
