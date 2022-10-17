const { 
	ReadGenre,
	CreateGenre,
	ReadGenreOne,
	UpdateGenre,
	DeleteGenre
} = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const language = req.headers.language
			const response = []
			const genres = await ReadGenre()
			for(let i of genres) {
				response.push({
					genre_id: i.genre_id,
					genre_name: (language === 'uz') ? i.genre_name : i.genre_name_ru
				})
			}
			res.status(200).json({data: language ? response : genres, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ONE: async(req, res) => {
		try {
			const genres = await ReadGenreOne(req.query)
			res.status(200).json({data: genres, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req, res) => {
		try {
			const data = req.body
			const newGenre = await CreateGenre(data)
			res.status(200).json({data: newGenre, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	UPDATE: async(req, res) => {
		try {
			const data = req.body
			const updateGenre = await UpdateGenre(data)
			res.status(200).json({data: updateGenre, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req, res) => {
		try {
			const data = req.body
			const deleteGenre = await DeleteGenre(data)
			res.status(200).json({data: deleteGenre, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
}