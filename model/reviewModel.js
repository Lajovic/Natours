const mongoose = require('mongoose')
const { getDate } = require('../business/helpersBusiness')
const Tour = require('./tourModel')

const reviewSchema = mongoose.Schema({
	review: {
		type: String,
		required: [
			true,
			'Please share with us your review about the tour.',
		],
	},
	rating: {
		type: Number,
		required: [true, 'Please rate the tour between 1 and 5'],
		min: [1, 'Please rate the tour between 1 and 5'],
		max: [5, 'Please rate the tour between 1 and 5'],
	},
	createdAt: {
		type: Date,
		default: getDate(),
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: [true, 'Reviews must belong to a user.'],
	},
	tour: {
		type: mongoose.Schema.ObjectId,
		ref: 'Tour',
		required: [true, 'Reviews must belong to a tour.'],
	},
})
// prevenindo reviews duplicadas por usuário
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })
reviewSchema.pre(/^find/, function (next) {
	// this.populate({ path: 'user', select: 'name photo' }).populate({
	// 	path: 'tour',
	// 	select: 'name',
	// })
	this.populate({ path: 'user', select: 'name photo' })
	next()
})
reviewSchema.statics.calcAverageRatings = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId },
		},
		{
			$group: {
				_id: '$tour',
				nRatings: { $sum: 1 },
				averageRating: { $avg: '$rating' },
			},
		},
	])
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRatings,
			ratingsAverage: stats[0].averageRating,
		})
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		})
	}
}
// atualiza ratings do tour quando um review é criado
reviewSchema.post('save', function () {
	this.constructor.calcAverageRatings(this.tour)
})
// atualiza ratings do tour quando um review é atualizado ou deletado
reviewSchema.pre(/^findOneAnd/, async function (next) {
	// Gravando um objeto doc na query pra ter acesso ao id dele no post
	this.r = await this.findOne()
	next()
})
reviewSchema.post(/^findOneAnd/, async function () {
	// this.r = await this.findOne() não funciona aqui pq a query já executou
	await this.r.constructor.calcAverageRatings(this.r.tour)
})

module.exports = mongoose.model('Review', reviewSchema)
