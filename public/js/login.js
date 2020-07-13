import axios from 'axios'
import { displayAlert } from './alerts'

export const login = async (email, password) => {
	try {
		// Exostem duas formas de passar uma requisição ao backend, uma é por http request como mostrado abaixo, outra é por html forms
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email,
				password,
			},
		})
		// Esse success é criado manualmente no json de response do backend
		if (res.data.status === 'success') {
			displayAlert('success', 'logged in successfully!')
			window.setTimeout(() => {
				location.assign('/')
			}, 1500)
		}
	} catch (err) {
		console.error(err);
		displayAlert('error', err.response.data.message) // esse .response.data.message veio do axios documentation pra erros e acessa msg de erros do backend
	}
}

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/logout',
		})

		if (res.data.status === 'success') location.assign('/')
	} catch (err) {
		displayAlert('error', 'Error loggin out! Please try again.')
	}
}


