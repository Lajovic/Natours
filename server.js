process.on('uncaughtException', (err) => handleUncaughtException(err))
const app = require('./app')
const DB = require('./db')

const port = process.env.PORT
const server = app.listen(port, () => {
	console.log(`Server on ${process.env.NODE_ENV} mode.`)
	console.log(`running on port ${port}`)
})

process.on('unhandledRejection', (err) =>
	handleUnhandledRejection(err)
)
function handleUncaughtException(err) {
	console.log('-----  UNHANDLED EXCEPTION!!! SERVER SHUTING DOWN...')
	console.log('err.name: ', err.name)
	console.log('err.message: ', err.message)
	console.error(err)
	process.exit(1)
}
function handleUnhandledRejection(err) {
	console.log('-----  UNHANDLED REJECTION!!! SERVER SHUTING DOWN...')
	console.log('err.name: ', err.name)
	console.log('err.message: ', err.message)
	server.close(() => {
		process.exit(1)
	})
}

// Específico para o SIGTERM do heroku.
process.on('SIGTERM', () => {
	console.log('SIGTERM RECEIVED, Shutting down gracefully.');
	server.close(() => {
		console.log('Process terminated!')
	})
})
