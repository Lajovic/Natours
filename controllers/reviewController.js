const Review = require('./../model/reviewModel')
const crudHandler = require('./../business/crudHandlerBusiness')

exports.setTourUserIds = (req, res, next) => {
	if (!req.body.tour) req.body.tour = req.params.tourId // nested route
	if (!req.body.user) req.body.user = req.user.id // nested route
	next()
}

exports.setSearchFilter = (req, res, next) => {
	let searchFilter = {}
	if (req.params.tourId)
		req.searchFilter = { tour: req.params.tourId }
	next()
}

exports.create = crudHandler.create(Review)
exports.getAll = crudHandler.getAll(Review)
exports.getOne = crudHandler.getOne(Review)
exports.update = crudHandler.update(Review)
exports.delete = crudHandler.deleteOne(Review)
