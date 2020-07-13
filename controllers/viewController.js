const Tour = require('./../model/tourModel')
const User = require('./../model/userModel')
const Booking = require('./../model/bookingModel')
const { asyncCatcher, throwError } = require('./../controllers/errController')

exports.getOverview = asyncCatcher(async (req, res, next) => {
	const tours = await Tour.find()
	res.status(200).render('overview', {
		title: 'All tours',
		tours,
	})
})

exports.getTour = asyncCatcher(async (req, res, next) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user',
	})

	if (!tour) throwError(`There is no tour with this name.`, 404, next)

	res.status(200).render('tour', {
		title: tour.name,
		tour,
	})
})

exports.getAccount = (req, res) => {
	res.status(200).render('account', {
		title: 'Your Account',
	})
}

exports.getLogin = (req, res) => {
	res.status(200).render('login', { title: 'Log into your account' })
}

exports.getMyTours = asyncCatcher(async (req, res, next) => {
	const bookings = await Booking.find({ user: req.user.id })

	const tourIds = bookings.map(el => el.tour)
	const tours = await Tour.find({ _id: { $in: tourIds } }) // para procurar usando um array de Ids como filtro
	
	res.status(200).render('overview', {
		title: 'My Tours',
		tours
	})
})

exports.updateUserData = asyncCatcher(async (req, res, next) => {
	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{
			name: req.body.name,
			email: req.body.email,
		},
		{
			new: true, // retprna o doc atualizado
			runValidators: true, // roda os validadores
		}
	)
	res.status(200).render('account', {
		title: 'Your Account',
		user: updatedUser,
	})
})
