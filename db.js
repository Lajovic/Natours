const mongoose = require('mongoose')
const dotEnv = require('dotenv')
dotEnv.config({ path: './config.env' })

class DB {
	constructor() {
		this.#connect()
	}

	#connect = () => {
		mongoose
			.connect(DB_CS, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false,
			})
			.then(() => console.log('DB connected.'))
	}
}

let DB_CS = process.env.DATABASE_CS
DB_CS = DB_CS.replace('<user>', process.env.DATABASE_USER)
DB_CS = DB_CS.replace('<password>', process.env.DATABASE_PASSWORD)

module.exports = new DB()
