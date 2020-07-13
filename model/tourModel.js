const mongoose = require('mongoose')
const { getDate } = require('../business/helpersBusiness')
const slugify = require('slugify')

//No caso do embbedding dos guides
// const User = require('./userModel')

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true,
			maxlength: [40, 'Á tour name must have 10 to 40 characters.'],
			minlength: [10, 'Á tour name must have 10 to 40 characters.'],
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'The tour must have a duration'],
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'The tour must have a group size'],
		},
		difficulty: {
			type: String,
			required: [true, 'The tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message:
					'Difficulty must be either easy, medium or difficult.',
			},
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			set: (val) => Math.round(val * 10) / 10, // 4.666666 => 46.66666 => 47 => 4.7
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		price: {
			type: Number,
			required: [true, 'The tour must have a price'],
		},
		priceDiscount: Number,
		summary: {
			type: String,
			trim: true,
			required: [true, 'The tour must have a summary'],
		},
		description: {
			type: String,
			trim: true,
		},
		imageCover: {
			type: String,
			required: [true, 'The tour must have a cover image'],
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		startDates: [Date],
		startLocation: {
			//GeoJSON
			type: {
				type: String,
				default: 'Point',
				enum: ['Point'],
			},
			coordinates: [Number],
			address: String,
			description: String,
		},
		locations: [
			//GeoJSON
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point'],
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number,
			},
		],
		// Embbeding guides
		// guides: Array,

		//Referencing guides
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User', // Não precisa importar o userModel.js pra referenciar
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)
tourSchema.index({ price: 1, ratingsAverage: -1 }) // 1: ascending order, -1 descending order
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })
/* 
	Temos um parent referencing nos reviews, mas não há como um tour saber quais são seus reviews.
	Pra resolver isso, criamos um virtual populate que é uma maneira de popular tour com os reviews, porém sem realmente adicioná-los no documento.
*/
tourSchema.virtual('reviews', {
	// campo a ser adicionado ^^^^^^
	ref: 'Review', // collection que o campo faz referência
	foreignField: 'tour', // campo da collection "Review" a ser conectado com algum campo daqui
	localField: '_id', // campo daqui a ser conectado com a "Review"
})
tourSchema.pre(/^find/, function (next) {
	this.populate('guides')
	this.find({ secretTour: { $ne: false } })
	this.start = getDate()
	next()
})
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})
// tourSchema.pre('aggregate', function (next) {
// Comentado para que o aggregate do geoNear (ver tourController.getDistances) seja o primeiro stage da pipeline
// this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
// console.log(this.pipeline());
// 	next()
// })

// tourSchema.post(/^find/, function () {
// 	console.log(
// 		`A query demorou ${getDate() - this.start} milisegundos!`
// 	)
// })

// Como fazer o embbed dos guides via id
// tourSchema.pre('save', async function (next) {
// 	const guidesPromises = this.guides.map(async id => await User.findById(id))
// 	this.guides = await Promise.all(guidesPromises)
// 	next()
// })

//Como referenciar os guides

module.exports = mongoose.model('Tour', tourSchema)
