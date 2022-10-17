const {
	ReadRTriller,
	CreateRTriller,
	DeleteRTriller,
	ReadRMovie,
	CreateRMovie,
	DeleteRMovie,
} = require('./model')
const geoip = require('geoip-lite')
const { ReadVideoOne } = require('../video-upload/model')
const model = require('../country/model')
const { geoIp } = require('../../../utils')
// const { verify } = require('../../../lib/jwt')

module.exports = {
	GET_TRILLER: async(req,res) => {
		const a =await ReadRTriller()
		try {
			const geo = geoIp(req) || ""
			const language = req.headers.language || 'ru'
			const data = []
			const response = await ReadRTriller()
			const tokenAdmin = req.headers.token || ''
			if (geo.country !== 'UZ' && tokenAdmin.length === 0) {
				for(let j of response) {
					if (j.movie_id !== null) {
						const i = await ReadVideoOne({ movieId: j.movie_id })
						// console.log("I = ", i);
						if (i.country_name_ru === 'Узбекистан') {
							data.push({
								triller_id: j.triller_id,
								triller_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
								triller_path: j.triller_path,
								movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
								movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
								movie_premeire_date: i.movie_premeire_date,
								movie_rate: i.movie_rate,
								movie_screen: i.movie_screen,
								movie_thumnail_path: i.movie_thumnail_path,
								movie_id: j.movie_id,
								movie_serial_is: i.movie_serial_is,
								country_id: i.country_id,
								country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
								recommended_triller_id: j.recommended_triller_id
							})
						}
					} else {
						const countryName = await model.ReadCountryOne({ id: j.triller_country_id })
						if (countryName.country_name_ru === 'Узбекистан') {
							data.push({
							triller_id: j.triller_id,
							triller_name: (language === 'uz') ? j.triller_name : j.triller_name_ru,
							triller_path: j.triller_path,
							movie_body: (language === 'uz') ? j.triller_body : j.triller_body_ru,
							movie_genre: (language === 'uz') ? j.triller_genre : j.triller_genre_ru,
							movie_premeire_date: j.triller_premeire_date,
							movie_rate: j.triller_rate,
							movie_thumnail_path: j.triller_thumnail_path,
							movie_screen: j.triller_screen,
							country_id: j.triller_country_id,
							country_name: (language === 'uz') ? countryName.country_name : countryName.country_name_ru,
							recommended_triller_id: j.recommended_triller_id,
						})
						}
					}
				}
			} else {
				for (let j of response) {
					if (j.movie_id !== null) {
						const i = await ReadVideoOne({ movieId: j.movie_id })

						data.push({
							triller_id: j.triller_id,
							triller_name: (language === 'uz') ? j.triller_name : j.triller_name_ru,
							triller_path: j.triller_path,
							movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
							movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
							movie_premeire_date: i.movie_premeire_date,
							movie_rate: i.movie_rate,
							movie_screen: i.movie_screen,
							movie_thumnail_path: i.movie_thumnail_path,
							movie_id: j.movie_id,
							movie_serial_is: i.movie_serial_is,
							country_id: i.country_id,
							country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
							recommended_triller_id: j.recommended_triller_id
						})
					} else {
						const countryName = await model.ReadCountryOne({ id: j.triller_country_id })
						data.push({
							triller_id: j.triller_id,
							triller_name: (language === 'uz') ? j.triller_name : j.triller_name_ru,
							triller_path: j.triller_path,
							movie_body: (language === 'uz') ? j.triller_body : j.triller_body_ru,
							movie_genre: (language === 'uz') ? j.triller_genre : j.triller_genre_ru,
							movie_premeire_date: j.triller_premeire_date,
							movie_rate: j.triller_rate,
							movie_thumnail_path: j.triller_thumnail_path,
							movie_screen: j.triller_screen,
							country_id: j.triller_country_id,
							country_name: (language === 'uz') ? countryName.country_name : countryName.country_name_ru,
							recommended_triller_id: j.recommended_triller_id,
						})
					}
				}
			}
		res.status(200).json({ data, status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: a })
	}
},
POST_TRILLER: async (req,res) => {
	try {
		const data = req.body
		for(let i of data) {
			await CreateRTriller(i)
		}
		res.status(200).json({ data: "ok", status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: null })
	}
},
DELETE_TRILLER: async (req,res) => {
	try {
		const data = req.body
		const response = await DeleteRTriller(data)
		res.status(200).json({ data: response, status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: null })
	}
},

GET_MOVIES: async(req,res) => {
	try {
		const geo = geoIp(req) || ""

		// console.log(geo)

		const language = req.headers.language
		const data = []
		const response = await ReadRMovie()

		if (geo.country !== 'UZ') {
			for(let i of response) {
				if (i.country_name_ru === 'Узбекистан') {
					data.push({
						movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
						movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
						movie_id: i.movie_id,
						movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
						movie_premeire_date: i.movie_premeire_date,
						movie_rate: i.movie_rate,
						movie_path: i.movie_path,
						movie_screen: i.movie_screen,
						movie_thumnail_path: i.movie_thumnail_path,
						country_id: i.country_id,
						country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
						recommended_movie_id: i.recommended_movie_id
					})
				}
			}
		} else {
			for(let i of response) {
				data.push({
					movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
					movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
					movie_id: i.movie_id,
					movie_name: (language === 'uz') ? i.movie_name : i.movie_name_ru,
					movie_premeire_date: i.movie_premeire_date,
					movie_rate: i.movie_rate,
					movie_path: i.movie_path,
					movie_screen: i.movie_screen,
					movie_thumnail_path: i.movie_thumnail_path,
					country_id: i.country_id,
					country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
					recommended_movie_id: i.recommended_movie_id
				})
			}
		}
		

		res.status(200).json({ data: language ? data : response, status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: null })
	}
},
POST_MOVIES: async (req,res) => {
	try {
		const data = req.body
		for(let i of data) {
			await CreateRMovie(i)
		}
		res.status(200).json({ data: "ok", status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: null })
	}
},
DELETE_MOVIES: async (req,res) => {
	try {
		const data = req.body
		const response = await DeleteRMovie(data)
		res.status(200).json({ data: response, status: 200, error: null})
	} catch (error) {
		res.status(400).json({ error: error.message, token: null, status: 400, data: null })
	}
},
}
