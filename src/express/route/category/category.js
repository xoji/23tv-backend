const { 
	ReadCategory,
	ReadCategoryMovies,
	ReadCategoryMoviesOffSet,
	ReadCategoryMoviesOffSetCount,
	CreateCategory,
	ReadCategoryOne,
	ReadCategorySingle,
	UpdateCategory,
	DeleteCategory
} = require('./model')
const { verify } = require('../../../lib/jwt')
const geoip = require('geoip-lite')
const { geoIp } = require('../../../utils')

module.exports = {
	GET: async(req, res) => {
		try {
			const token = req.headers.authorization
			// console.log('token', token)
			const tokenAdmin = req.headers.token
			// console.log('tokenAdmin',tokenAdmin)
			const language = req.headers.language
			const categories = await ReadCategory()
			const response = []
			// console.log(req.headers)
			const geo = geoIp(req) || ""

			// console.log(geo)
			if (geo.country !== 'UZ') {
				for(let i of categories) {
					if (
						i.category_name === 'Uzbek seriallar' ||
						i.category_name === 'Uzbek kinolar'
						) {
						response.push({
							category_id: i.category_id,
							category_name: (language === 'uz') ? i.category_name : i.category_name_ru
						})
				}
			}
			res.status(200).json({data: language ? response : categories, error: null, status: '200'})					
		} else {
			for(let i of categories) {
				response.push({
					category_id: i.category_id,
					category_name: (language === 'uz') ? i.category_name : i.category_name_ru
				})
			}
			res.status(200).json({data: language ? response : categories, error: null, status: '200'})					
		}

	} catch (error) {
		res.status(404).json({data: null, error: error.message, status: '404'})
	}
},
GET_WITH_MOVIE: async(req, res) => {
	try {
		const language = req.headers.language
		const categories = await ReadCategory()
		const response = []

		const token = req.headers.authorization || 'null'
		const geo = geoIp(req) || "";
		function sortMovieValue (value, isNational) {
			const data = value
			const response = []
			if (isNational){
				for (let i of data) {
					response.push({
						movie_id: i.movie_id,
						movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
						movie_path: i.movie_path,
						movie_thumnail_path: i.movie_thumnail_path,
						movie_premeire_date: i.movie_premeire_date,
						movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
						movie_length: i.movie_length,
						movie_age: i.movie_age,
						movie_4k_is: i.movie_4k_is,
						movie_screen: i.movie_screen,
						movie_serial_is: i.movie_serial_is,
						movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
						category_id: i.category_id,
						category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					})
				}
			} else {
				for (let i of data) {
					if (i.movie_country === '6ce14688-7a0d-437f-b9d1-7c897af72c8f') {
						response.push({
							movie_id: i.movie_id,
							movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
							movie_path: i.movie_path,
							movie_thumnail_path: i.movie_thumnail_path,
							movie_premeire_date: i.movie_premeire_date,
							movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
							movie_length: i.movie_length,
							movie_age: i.movie_age,
							movie_4k_is: i.movie_4k_is,
							movie_screen: i.movie_screen,
							movie_serial_is: i.movie_serial_is,
							movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
							category_id: i.category_id,
							category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
						})
					}
				}
			}
			return response
		}
		if (geo.country !== 'UZ') {
			for(let i of categories) {
				const movies = await ReadCategoryMovies({ categoryName: i.category_name_ru })
				const sorted = movies.filter(movie => {
					return !movie.hidden
				})
				response.push({
					category_id: i.category_id,
					category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					movies: sortMovieValue(sorted, false)
				})
		}
		res.status(200).json({data: language ? response : categories, error: null, status: '200'})
		} else {
			for(let i of categories) {
				const movies = await ReadCategoryMovies({ categoryName: i.category_name_ru })
				const sorted = movies.filter(movie => {
					return !movie.hidden
				})
				response.push({
					category_id: i.category_id,
					category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					movies: sortMovieValue(sorted, true)
				})
			}
			res.status(200).json({data: response, error: null, status: '200'})
		}
} catch (error) {
	res.status(404).json({data: null, error: error.message, status: '404'})
}
},
GET_ONE: async(req, res) => {
	try {
		const categories = await ReadCategorySingle(req.query)
		res.status(200).json({data: categories, error: null, status: '200'})
	} catch (error) {
		res.status(404).json({data: null, error: error.message, status: '404'})
	}
},
POST: async(req, res) => {
	try {
		const data = req.body
		const newCategory = await CreateCategory(data)
		res.status(200).json({data: newCategory, error: null, status: '200'})
	} catch (error) {
		res.status(404).json({data: null, error: error.message, status: '404'})
	}
},
GET_SIMILAR_MOVIES: async (req, res) => {
	try {
		const language = req.headers.language
		const data = req.query
		const movies = await ReadCategoryMovies(data)
		const response = []

		if(!movies) throw new Error
			for(let i of movies) {
				if(data.movieId !== i.movie_id) {
					response.push({
						movie_id: i.movie_id,
						movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
						movie_thumnail_path: i.movie_thumnail_path,
						movie_premeire_date: i.movie_premeire_date,
						movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
						movie_rate: i.movie_rate,
						movie_length: i.movie_length,
						movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
						movie_4k_is: i.movie_4k_is,
						movie_age: i.movie_age,
						movie_screen: i.movie_screen,
						category_id: i.category_id,
						category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					})
				}
			}
			res.status(200).json({data: language ? response : movies, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_CATEGORY_MOVIE: async (req, res) => {
		try {
			const language = req.headers.language
			const data = req.query
			const categories = await ReadCategoryOne({ categoryName: data.categoryName})
			let dataReq = {
				categoryName: data.categoryName,
				paged: ((data.page || 1) - 1) * 6
			}
			const movies = await ReadCategoryMoviesOffSet(dataReq)
			const sorted = movies.filter(movie => {
				return !movie.hidden
			})
			const moviesCount = await ReadCategoryMoviesOffSetCount(dataReq)
			const response = []
			const resData = {
				categories,
				data: sorted,
				count: Math.ceil((moviesCount.count - 0) / 6)
			}
			const resDataSort = {
				category: {
					category_id: categories.category_id,	
					category_name: (language === 'uz') ? categories.category_name : categories.category_name_ru,
				},
				data: response,
				count: Math.ceil((moviesCount.count - 0) / 6)
			}
			if(!movies) throw new Error
				for(let i of movies) {
					if (!i.hidden){
						response.push({
							movie_id: i.movie_id,
							movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
							movie_thumnail_path: i.movie_thumnail_path,
							movie_premeire_date: i.movie_premeire_date,
							movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
							movie_rate: i.movie_rate,
							movie_length: i.movie_length,
							movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
							movie_4k_is: i.movie_4k_is,
							movie_age: i.movie_age,
							movie_screen: i.movie_screen,
							movie_serial_is: i.movie_serial_is
						})
					}
				}
				res.status(200).json({data: language ? resDataSort : resData, error: null, status: '200'})
			} catch (error) {
				res.status(404).json({data: null, error: error.message, status: '404'})
			}
		},
		UPDATE: async(req, res) => {
			try {
				const data = req.body
				const updateCategory = await UpdateCategory(data)
				res.status(200).json({data: updateCategory, error: null, status: '200'})
			} catch (error) {
				res.status(404).json({data: null, error: error.message, status: '404'})
			}
		},
		DELETE: async(req, res) => {
			try {
				const data = req.body
				const deleteCategory = await DeleteCategory(data)
				res.status(200).json({data: deleteCategory, error: null, status: 200})
			} catch (error) {
				res.status(404).json({data: null, error: error.message, status: 404})
			}
		},

	}
