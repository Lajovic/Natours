import { displayAlert } from './alerts'
import axios from 'axios'

export const updateUserSettings = async (data, type) => {
	try {
		const url =
			type === 'password'
				? '/api/v1/users/password/'
				: '/api/v1/users/me'

		const res = await axios({
			method: 'PATCH',
			url,
			data,
		})

		if (res.data.status === 'success')
			displayAlert('success', 'Your settings were successfully updated!')
	} catch (err) {
		displayAlert('error', err.response.data.message) // esse .response.data.message veio do axios documentation pra erros e acessa msg de erros do backend
	}
}
