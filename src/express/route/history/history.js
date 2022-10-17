const { 
	ReadHistoryMovie
} = require('./model')
const { verify } = require('../../../lib/jwt')
const moment = require('moment')

module.exports = {
	GET: async(req, res) => {
		try {
			const data = verify(req.headers.authorization)
			const language = req.headers.language
			const hMovies = await ReadHistoryMovie(data)
			const response = []
			for(let i of hMovies) {
				response.push({
					history_id: i.history_id,
					created_at: moment(i.created_at).from(),
					user_id: i.user_id,
					country_id: i.country_id,
					movie_id: i.movie_id,
					movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
					country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
					movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
					movie_thumnail_path: i.movie_thumnail_path,
					movie_serial_is: i.movie_serial_is,
					movie_4k_is: i.movie_4k_is,
					movie_age: i.movie_age,
				})
			}
			res.status(200).json({data: response, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	}
}