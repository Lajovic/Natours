const dotEnv = require('./node_modules/dotenv')
const mongoose = require('mongoose')
const Tour = require('../model/tourModel')
const Review = require('../model/reviewModel')
const User = require('../model/userModel')
const fs = require('fs')
dotEnv.config({ path: './config/config.env' })

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json'))
const users = JSON.parse(fs.readFileSync('./dev-data/data/users.json'))
const reviews = JSON.parse(fs.readFileSync('./dev-data/data/reviews.json'))

let DB_CS = process.env.DATABASE_CS
DB_CS = DB_CS.replace('<user>', process.env.DATABASE_USER)
DB_CS = DB_CS.replace('<password>', process.env.DATABASE_PASSWORD)

mongoose
	.connect(DB_CS, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then(console.log('DB connected.'))

const imp = async () => {
	try {
		await Tour.create(tours)
		await User.create(users, { validateBeforeSave: false })
		await Review.create(reviews)
		console.log('imported!')
	} catch (err) {
		console.log(err)
	}
	process.exit()
}

const del = async () => {
	try {
		await Tour.deleteMany()
		await User.deleteMany()
		await Review.deleteMany()
		console.log('deleted!')
	} catch (err) {
		console.log(err)
	}
	process.exit()
}

if (process.argv[2] === '--import') {
	imp()
} else if (process.argv[2] === '--delete') {
	del()
}
