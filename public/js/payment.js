import axios from 'axios'
import { displayAlert } from './alerts'

export const bookTour = async (tourId) => {
	try {
		const stripe = Stripe(
			'pk_test_51H47ydIqjJ3DKEpRMujzYorMsAWfHo8BMMZ5roPVS8FV5WBllv54reRtsq0bEhTZACvl5g6ImlnlyMHC3QCHFipC00hbnOrQw8'
		)
		const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id,
		})
	} catch (err) {
		console.error(err)
		displayAlert('error', err)
	}
}
