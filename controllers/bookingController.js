const Tour = require('./../model/tourModel')
const User = require('./../model/userModel')
const Booking = require('./../model/bookingModel')
const crudHandler = require('./../business/crudHandlerBusiness')
const { asyncCatcher } = require('./errController')
const Stripe = require('stripe')

exports.getCheckoutSession = asyncCatcher(async (req, res, next) => {
	const stripe = Stripe(process.env.STRIPE_KEY)
	const tour = await Tour.findById(req.params.tourId)
	const baseURL = `${req.protocol}://${req.get('host')}`
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			// URLs para testes de pagamento sem precisar que a aplicação esteja rodando hospedada (não usar em produção)
			// success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${
			// 	req.user.id
			// }&price=${tour.price}`,
			success_url: `${baseURL}/my-tours/`,
			cancel_url: `${baseURL}/tour/${tour.slug}`,
			customer_email: req.user.email,
			client_reference_id: req.params.tourId,
			line_items: [
				{
					name: `${tour.name} Tour`,
					description: tour.summary,
					images: [`${baseURL}/img/tours/${tour.imageCover}`],
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
	} catch (error) {
		console.error(error);
	}
})

const createBookingCheckout = async(session) => {
	const tour = session.client_reference_id
	const user = await User.findOne({ email: session.customer_email })
	const price = session.line_items[0].amount / 100 // de centavos pra dólares
	console.log('tour, user, price: ', tour, user, price);
	await Boooking.create(tour, user, price)
}

exports.webhookCheckout = (req, res, next) => {
	const signature = req.headers['stripe-signature']
	const stripe = Stripe(process.env.STRIPE_KEY)
	let event
	try {
		event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
	} catch (err) {
		return res.status(400).send(`Webhook error: ${err.message}`)
	}
	
	if (event.type === 'checkout.session.completed')
		createBookingCheckout(event.data.object)
	
	res.status(200).json({ received: true })
}



// Código temporário para ver o processo de pagamento mesmo sem tem um site no ar
// É temporário pq qualquer um poderia fazer bookings sem pagar acessando essa URL
// exports.createBookingCheckout = asyncCatcher(async (req, res, next) => {

// 	const { tour, user, price } = req.query
//     if (!tour || !user || !price) return next()
//     await Booking.create({ tour, user, price })

//     res.redirect(req.originalUrl.split('?')[0])
// })

exports.create = crudHandler.create(Booking)
exports.getAll = crudHandler.getAll(Booking)
exports.getOne = crudHandler.getOne(Booking)
exports.update = crudHandler.update(Booking)
exports.delete = crudHandler.deleteOne(Booking)
