import '@babel/polyfill'
import { login } from './login'
import { displayMap } from './mapBox'
import { logout } from './login'
import { updateUserSettings } from './updateUserSettings'
import { bookTour } from './payment'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userDataPassword = document.querySelector('.form-user-password')
const bookBtn = document.querySelector('#bookTour')

if (loginForm)
	loginForm.addEventListener('submit', (e) => {
		e.preventDefault()
		const email = document.getElementById('email').value
		const password = document.getElementById('password').value
		login(email, password)
	})

if (logoutBtn) logoutBtn.addEventListener('click', logout)

if (userDataForm) {
	userDataForm.addEventListener('submit', (e) => {
		e.preventDefault()

		// Para enviar JSON e arquivos
		const form = new FormData()
		form.append('name', document.getElementById('name').value)
		form.append('email', document.getElementById('email').value)
		form.append('photo', document.getElementById('photo').files[0])

		// Para enviar apenas JSON
		// const name = document.getElementById('name').value
		// const email = document.getElementById('email').value

		updateUserSettings(form, 'data')
	})
}

if (userDataPassword) {
	userDataPassword.addEventListener('submit', async (e) => {
		e.preventDefault()

		document.querySelector('#btnSavePassword').textContent = 'Updating password...'

		const oldPassword = document.getElementById('password-current').value
		const password = document.getElementById('password').value
		const passwordConfirm = document.getElementById('password-confirm').value
		await updateUserSettings({ oldPassword, password, passwordConfirm }, 'password')

		document.getElementById('password-current').value = ''
		document.getElementById('password').value = ''
		document.getElementById('password-confirm').value = ''
		document.querySelector('#btnSavePassword').textContent = 'Save password'
	})
}

if (bookBtn) {
	bookBtn.addEventListener('click', (e) => {
		e.preventDefault()
		e.target.textContent = 'Processing...'
		const { tourId } = e.target.dataset
		bookTour(tourId)
	})
}

if (mapBox) {
	const locations = JSON.parse(mapBox.dataset.locations)
	displayMap(locations)
}
