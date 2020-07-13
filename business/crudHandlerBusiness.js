const { throwError } = require('./../controllers/errController')
const { asyncCatcher } = require('./../controllers/errController')
const QueryBuilder = require('../Business/queryBusiness')

exports.create = (Model) =>
	asyncCatcher(async (req, res, next) => {
		const doc = await Model.create(req.body)
		res.status(201).json({
			msgStatus: 'success',
			requestTime: req.requestTime,
			data: {
				data: doc,
			},
		})
	})
exports.getAll = (Model) =>
	asyncCatcher(async (req, res, next) => {
		let searchFilter = {}
		if (req.searchFilter) searchFilter = req.searchFilter
		const query = new QueryBuilder(Model.find(searchFilter), req.query)
		const doc = await query.documentToFind
		// const doc = await query.documentToFind.explain() ------ Dá detalhes sobre a query, por ex. qts documents o DB precisou percorrer pra retornar o resultado

		res.status(200).json({
			msgStatus: 'success',
			requestTime: req.requestTime,
			results: doc.length,
			data: {
				data: doc,
			},
		})
	})
exports.getOne = (Model, popOptions) =>
	asyncCatcher(async (req, res, next) => {
		// por trás dos panos o mongoose faz: Model.findOne({ _id: req.params.id })
		let query = Model.findById(req.params.id)
		if (popOptions) query = query.populate(popOptions)
		const doc = await query
		if (!doc) return throwError('This ID does not exist', 404, next)
		res.status(200).json({
			msgStatus: 'success',
			requestTime: req.requestTime,
			data: {
				doc,
			},
		})
	})

// TODO: montar um excluded fields pra req.body.admin e outros campos que não deveriam ser alterados por update
exports.update = (Model) =>
	asyncCatcher(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})
		if (!doc) return throwError('This ID does not exist', 404, next)
		res.status(200).json({
			msgStatus: 'success',
			requestTime: req.requestTime,
			data: {
				data: doc,
			},
		})
	})
exports.deleteOne = (Model) =>
	asyncCatcher(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id)
		if (!doc) return throwError('This ID does not exist', 404, next)
		return res.status(204).json({
			msgStatus: 'success',
			requestTime: req.requestTime,
			data: null,
		})
	})
