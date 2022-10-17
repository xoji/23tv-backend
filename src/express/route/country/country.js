const {
	ReadCountry,
	CreateCountry,
	ReadCountryOne,
	UpdateCountry,
	DeleteCountry
} = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const language = req.headers.language
			const response = []
			const countries = await ReadCountry()
			for(let i of countries) {
				response.push({
					country_id: i.country_id,
					country_name: (language === 'uz') ? i.country_name : i.country_name_ru
				})
			}
			res.status(200).json({data: language ? response : countries, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},

	GET_ONE: async(req, res) => {
		try {
			const countries = await ReadCountryOne(req.query)
			res.status(200).json({data: countries, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req, res) => {
		try {
			const data = req.body
			const newCountry = await CreateCountry(data)
			res.status(200).json({data: newCountry, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	UPDATE: async(req, res) => {
		try {
			const data = req.body
			const updateCountry = await UpdateCountry(data)
			res.status(200).json({data: updateCountry, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req, res) => {
		try {
			const data = req.body
			const deleteCountry = await DeleteCountry(data)
			res.status(200).json({data: deleteCountry, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
}