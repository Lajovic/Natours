const Tour = require('./../model/tourModel')
const Booking = require('./../model/bookingModel')
const crudHandler = require('./../business/crudHandlerBusiness')
const { asyncCatcher } = require('./errController')
const Stripe = require('stripe')

exports.getCheckoutSession = asyncCatcher(async (req, res, next) => {
	const stripe = Stripe(process.env.STRIPE_KEY)
	const tour = await Tour.findById(req.params.tourId)
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${
			req.user.id
		}&price=${tour.price}`,
		cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
		customer_email: req.user.email,
		client_reference_id: req.params.tourId,
		line_items: [
			{
				name: `${tour.name} Tour`,
				description: tour.summary,
				images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
				amount: tour.price * 100, // preço em centavos
				currency: 'usd',
				quantity: 1,
			},
		],
	})
	res.status(200).json({
		status: 'success',
		session,
	})
})

exports.createBookingCheckout = asyncCatcher(async (req, res, next) => {
    
    // temporário pq qq um pode fazer bookings sem pagar acessand a URL
	const { tour, user, price } = req.query
    if (!tour || !user || !price) return next()
    await Booking.create({ tour, user, price })
    
    res.redirect(req.originalUrl.split('?')[0])
})

exports.create = crudHandler.create(Booking)
exports.getAll = crudHandler.getAll(Booking)
exports.getOne = crudHandler.getOne(Booking)
exports.update = crudHandler.update(Booking)
exports.delete = crudHandler.deleteOne(Booking)
