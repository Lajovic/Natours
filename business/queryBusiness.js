class QueryBuilder {
	constructor(documentToFind, queryRequest) {
		this.documentToFind = documentToFind
		this.queryRequest = queryRequest
		this.#init()
	}
	set queryRequest(queryReq) {
		this.queryOriginal = queryReq
		this.querySearchableFieldsOnly = this.#filter(queryReq)
	}
	#init = () => {
		this.documentToFind.find(this.querySearchableFieldsOnly)
		this.#sort()
		this.#selectFields()
		this.#paginate()
	}
	#filter = (query) => {
		let filteredQuery = this.#removeUnecessaryQueryFields(query)
		filteredQuery = this.#formatMongoOperators(filteredQuery)
		return filteredQuery
	}
	#sort = () => {
		if (this.queryOriginal.sort) {
			const sortBy = this.queryOriginal.sort.split(',').join(' ')
			this.documentToFind.sort(sortBy)
		} else {
			this.documentToFind.sort('-createdAt')
		}
	}
	#selectFields = () => {
		if (this.queryOriginal.fields) {
			const fieldsToShow = this.queryOriginal.fields
				.split(',')
				.join(' ')
			this.documentToFind.select(fieldsToShow)
		} else {
			this.documentToFind.select('-__v')
		}
	}
	#paginate = () => {
		const page = +this.queryOriginal.page || 1
		const limit = +this.queryOriginal.limit || 100
		const skip = (page - 1) * limit
		this.documentToFind.skip(skip).limit(limit)
	}
	// #region Utils
	#removeUnecessaryQueryFields = (query) => {
		let _query = { ...query }
		const fieldsToExclude = ['limit', 'page', 'sort', 'fields']
		fieldsToExclude.forEach((field) => {
			delete _query[field]
		})
		return _query
	}
	#formatMongoOperators = (query) => {
		let _query = JSON.stringify(query)
		_query = _query.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		)
		_query = JSON.parse(_query)
		return _query
	}
	// #endregion
}
module.exports = QueryBuilder
