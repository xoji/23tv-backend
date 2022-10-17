const { 
	ReadFavouriteMovie,
	ReadFavouriteMovieOne,
	CreateFavouriteMovie,
	DeleteFavouriteMovie
} = require('./model')
const { sign, verify } = require('../../../lib/jwt')
const moment = require('moment')
module.exports = {
	GET: async(req, res) => {
		try {
			const data = verify(req.headers.authorization)
			const language = req.headers.language
			const fMovies = await ReadFavouriteMovie(data)
			const response = []
			for(let i of fMovies) {
				response.push({
					favourite_movie_id: i.favourite_movie_id,
					created_at: moment(i.created_at).from(),
					user_id: i.user_id,
					country_id: i.country_id,
					country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
					movie_id: i.movie_id,
					movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
					movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
					movie_serial_is: i.movie_serial_is,
					movie_thumnail_path: i.movie_thumnail_path,
					movie_4k_is: i.movie_4k_is,
					movie_age: i.movie_age,
				})
			}
			res.status(200).json({data: response, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ONE: async(req, res) => {
		try {
			const { id } = verify(req.headers.authorization)
			const { movieId } = req.query
			const data = {
				movieId,
				userId: id
			}
			const fMovies = await ReadFavouriteMovieOne(data)
			res.status(200).json({data: fMovies ? true : false, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req, res) => {
		try {
			const { id } = verify(req.headers.authorization)
			const { movieId } = req.body
			const data = {
				userId: id,
				movieId
			}
			const newFMovie = await CreateFavouriteMovie(data)
			res.status(200).json({data: newFMovie, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req, res) => {
		try {
			const { id } = verify(req.headers.authorization)
			const { movieId } = req.body
			const data = {
				userId: id,
				movieId
			}
			const deleteFMovie = await DeleteFavouriteMovie(data)
			res.status(200).json({data: deleteFMovie, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
}