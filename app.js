const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const viewRouter = require('./routes/viewRoutes')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const bookingController = require('./controllers/bookingController')
const path = require('path')
const { getDate } = require('./business/helpersBusiness')
const { throwError } = require('./controllers/errController')
const { globalErrorHandler } = require('./controllers/errController')
const compression = require('compression')
const cors = require('cors')

const app = express()

// Helmet é um compilado de middlewares de segurança (mais info no github)
// É modular, dá pra ligar e desligar muita coisa, mas o padrão já é bom o suficiente sem precisar mexer em nada
// Seta headers de segurança automaticamente, sempre usado com express e sempre posicionado no topo dos middlewares
app.use(helmet())

// Logger pra desenvolvimento
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'))
}

// anti DDoS, limitador de conexões do mesmo ip. É possível ver nos headers quantas requests restam
const conectionsLimiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000, // 1 hour
	message: 'Too many requests from this IP, please try again in an hour!',
})
app.use('/api', conectionsLimiter)

// Os dados do body não podem estar em JSON pra isso funcionar, por isso essa rota está nessa posição.
app.post(
	'/webhook-checkout',
	express.raw({ type: 'application/json' }),
	bookingController.webhookCheckout
)

// BodyParser, 10kb é o limite de tamanho que definimos para o app aceitar por segurança, mas é opcional
app.use(express.json({ limit: '10kb' }))

// Faz o parse do cookie para que o back-end entenda
app.use(cookieParser())

// Para uso de envio de dados via form (sem API)
// Faz com que o exmpress entenda informações vindas no req.body de um formulário html
// app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Data sanitization against no-sql query injection
app.use(mongoSanitize())

// Data sanitization against XSS (protect against html+js injection by converting html symbols)
app.use(xss())

// Retira parâmetros duplicados (parameter pollution), exceto os da whitelist
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'difficulty',
			'price',
		],
	})
)

// Funciona pra requests simples, get e post
app.use(cors())

// Pra requests complexas como put, patch, delete, operações com cookies precisa do código abaixo
// "options" é só mais um http verb como put, get, post, etc
app.options('*', cors())

// Poderia ser mais específico como no exemplo abaixo
// app.options('/api/v1/tours/:id', cors())

// para poder ler no heroku se a conexão é segura com req.headers['x-forwarded-proto'] === 'https'
app.enable('trust proxy')

// Server-side rendering engine (pug é a mais usada, mas existe a ejs e handlebars)
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Serve arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// Compressor GZIP de textos enviados ao client
app.use(compression())

// Middleware de testes
app.use((req, res, next) => {
	req.requestTime = getDate()
	next()
})

// Rotas
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)
app.all('*', (req, res, next) => {
	throwError(`Can't find ${req.originalUrl}`, 404, next)
})

app.use(globalErrorHandler)

module.exports = app
