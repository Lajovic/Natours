const nodemailer = require('nodemailer')
const pug = require('pug')
const path = require('path')
const htmlToText = require('html-to-text')

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email
		this.firstName = user.name.split(' ')[0]
		this.url = url
		this.from = `igor L <${process.env.EMAIL_FROM}>`
	}

	createTransport() {
		if (process.env.NODE_ENV === 'production')
			return nodemailer.createTransport({
				service: 'SendGrid', // Alguns servidores são pré-especificados no nodemailer, sendgrid é um deles, não precisa de config extra
				auth: {
					user: process.env.EMAIL_USERNAME,
					pass: process.env.EMAIL_PASSWORD,
				},
			})
		return nodemailer.createTransport({
			host: process.env.EMAIL_TEST_HOST,
			port: process.env.EMAIL_TEST_PORT,
			auth: {
				user: process.env.EMAIL_TEST_USERNAME,
				pass: process.env.EMAIL_TEST_PASSWORD,
			},
		})
	}

	async send(template, subject) {
		const templateFile = path.resolve(__dirname, '..', 'views', 'emails', `${template}.pug`)
		const templateCustomization = {
			firstName: this.firstName,
			url: this.url,
			subject,
		}
		const html = pug.renderFile(templateFile, templateCustomization)

		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText.fromString(html),
		}
		await this.createTransport().sendMail(mailOptions)
	}

	async sendWelcome() {
		await this.send('welcome', 'Welcome to the Natours Family!')
	}

	async sendPasswordReset() {
		await this.send('passwordReset', 'Password Recovery (valid for only 10 min)')
	}
}
