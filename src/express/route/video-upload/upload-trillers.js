const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
// const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
// ffmpeg.setFfmpegPath(ffmpegInstaller.path)
// const path = require('path')
const { 
	ReadTriller,
	ReadTrillerAll,
	ReadTrillerSpecial,
	CreateTriller,
	CreateTrillerNotMovieId,
	DeleteTriller,
	createGenre,
	createCat,
	createActor,
	createDirec, DeleteTrillerFor
} = require('./model_trillers')
const { ReadVideoOne } = require('./model')
const { deleteFile } = require('../../../utils')

module.exports = {
	GET: async (req, res) => {
		try {
			const language = req.headers.language
			const data = req.query
			const response = []
			const videos = await ReadTriller(data)

			for(let i of videos) {
				response.push({
					triller_id: i.triller_id,
					triller_name: (language === 'uz') ? i.triller_name : i.triller_name_ru,
					triller_path: i.triller_path,
					movie_id: i.movie_id,
					movie_body: (language === 'uz') ? i.movie_body : i.movie_body_ru,
					movie_screen: i.movie_screen,
					movie_serial_is: i.movie_serial_is,
					movie_age: i.movie_age,
					movie_thumnail_path: i.movie_thumnail_path,
					movie_rate: i.movie_rate,
					movie_premeire_date: i.movie_premeire_date,
					movie_genre: (language === 'uz') ? i.movie_genre : i.movie_genre_ru,
					movie_path: i.movie_path,
					country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
					category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
				})
			}
			res.json({data: language ? response : videos, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ALL: async (req, res) => {
		try {
			const language = req.headers.language
			const data = req.query
			const response = []
			const videos = await ReadTrillerAll()
			// console.log("LANGUAGE ", language);
			// console.log(videos)

			for(let i of videos) {
				if(i.movie_id){
					const movie = await ReadVideoOne({movieId: i.movie_id})
					response.push({
						triller_id: i.triller_id,
						triller_name: (language === 'uz') ? i.triller_name : i.triller_name_ru,
						triller_path: i.triller_path,
						movie_id: movie.movie_id,
						movie_body: (language === 'uz') ? movie.movie_body : movie.movie_body_ru,
						movie_screen: movie.movie_screen,
						movie_serial_is: movie.movie_serial_is,
						movie_thumnail_path: movie.movie_thumnail_path,
						movie_rate: movie.movie_rate,
						movie_age: movie.movie_age,
						movie_premeire_date: movie.movie_premeire_date,
						movie_genre: (language === 'uz') ? movie.movie_genre : movie.movie_genre_ru,
						movie_path: movie.movie_path,
						country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
						category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					})
				} else {
					response.push({
						triller_id: i.triller_id,
						triller_name: (language === 'uz') ? i.triller_name : i.triller_name_ru,
						triller_path: i.triller_path,
						movie_id: i.movie_id,
						movie_body: (language === 'uz') ? i.triller_body : i.triller_body_ru,
						movie_screen: i.triller_screen,
						movie_serial_is: i.triller_serial_is,
						movie_thumnail_path: i.triller_thumnail_path,
						movie_rate: i.triller_rate,
						movie_age: i.triller_age,
						movie_premeire_date: i.triller_premeire_date,
						movie_genre: (language === 'uz') ? i.triller_genre : i.triller_genre_ru,
						movie_path: i.movie_path,
						country_name: (language === 'uz') ? i.country_name : i.country_name_ru,
						category_name: (language === 'uz') ? i.category_name : i.category_name_ru,
					})
				}
			}
			res.json({data: response , error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_SPECIAL: async (req, res) => {
		try {
			const videos = await ReadTrillerSpecial()
			res.json({data: videos, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: (req,res) => {
		try {
			const file = req.files.file
			const data= req.body

			// const file = req.files.file
			// 	const data= req.body
			// console.log(data.id !== null)
			if (data.id !== '') {
				const filePath = `${new Date().getTime()}${data.video4K === 'true' ? '_4K' : ''}`

				file.mv(`./src/assets/trillers/${filePath}.mp4`, function (err) {
					if (err) return res.sendStatus(500).send(err)
						console.log(`Triller Uploaded successfully`)
				})

				ffmpeg(`./src/assets/trillers/${filePath}.mp4`)
				.on('progress', function(progress) {
					console.log('Processing: ' + progress.percent + '% done')
				})
				.output(`./src/assets/trillers/${filePath}_360p.mp4`)
				.audioCodec('copy')
				.size('720x360')

				.output(`./src/assets/trillers/${filePath}_720p.mp4`)
				.audioCodec('copy')
				.size('1280x720')

				.on('error', function(err, stdout, stderr) {
					console.log('An error triller occurred: ' + err)
					if (`./src/assets/trillers/${filePath}.mp4`) {
						deleteFile(`/assets/trillers/${filePath}.mp4`)
					}else {
						throw Error
					}
				})

				.on('end', async function() {
					console.log('Processing triller finished !')

					const datares = {
						trillerPath: filePath,
						trillerName: data.fileName,
						trillerNameRu: data.fileNameRu,
						video4K: data.video4K === 'true' ? true : false,
						movieId: data.id || null
					}

					const newTriller = await CreateTriller(datares)

					if (data.video4K === 'false') {
						deleteFile(`/assets/trillers/${filePath}.mp4`)
					}

					res.json({data: newTriller, error: null, status: 200})
				})
				.save(`./src/assets/trillers/${filePath}_HD.mp4`)
			} else {
				const filePath = `${new Date().getTime()}${data.video4K === 'true' ? '_4K' : ''}`

					file.mv(`./src/assets/trillers/${filePath}.mp4`, function (err) {
						if (err) return res.sendStatus(500).send(err)
							console.log(`Triller Uploaded successfully`)
					})

					ffmpeg(`./src/assets/trillers/${filePath}.mp4`)
						.on('progress', function(progress) {
							console.log('Processing: ' + progress.percent + '% done')
						})
						.output(`./src/assets/trillers/${filePath}_360p.mp4`)
						.audioCodec('copy')
						.size('720x360')

						.output(`./src/assets/trillers/${filePath}_720p.mp4`)
						.audioCodec('copy')
						.size('1280x720')

						.on('error', function(err, stdout, stderr) {
							console.log('An error triller occurred: ' + err)
							if (`./src/assets/trillers/${filePath}.mp4`) {
								deleteFile(`/assets/trillers/${filePath}.mp4`)
							}else {
								throw Error
							}
						})

					.on('end', async function() {
						console.log('Processing triller finished !')

						const datares = {
							trillerPath: filePath,
							trillerName: data.fileName,
							trillerNameRu: data.fileNameRu,
							video4K: data.video4K === 'true' ? true : false,
							movieId: null,
							trillerCountryID: data.country,
							videoPremeireDate: data.videoPremeireDate,
							genreName: data.genreName,
							genreNameRu: data.genreNameRu,
							screenShot: `screen/${data.screenShot}`,
							trillerBody: data.videoBody,
							trillerBodyRu: data.videoBodyRu,
							movieAge: data.movieAge - 0,
							trillerRate: ((data.videoRate - 0) > 0) ? (data.videoRate - 0) : 0,
							trillerThubnail: `thubnails/${data.thubnail}`
						}

						// console.log(datares)

						const newTriller = await CreateTrillerNotMovieId(datares)
						const trillerId = newTriller.triller_id

						for(let i of data.genres.split(',')) {
							await createGenre(i, trillerId)
						}

						for(let i of data.category.split(',')) {
							await createCat(i, trillerId)
						}

						for(let i of data.director.split(',')) {
							await createDirec(i, trillerId)
						}

						for(let i of data.actor.split(',')) {
							await createActor(i, trillerId)
						}

						if (data.video4K === 'false') {
							deleteFile(`/assets/trillers/${filePath}.mp4`)
						}

						res.json({data: newTriller, error: null, status: 200})
					})
					.save(`./src/assets/trillers/${filePath}_HD.mp4`)
			}

			// res.json({data: 'ok'})
			
		} catch (error) {
			res.json({data: null, error: error, status: 404})
		}
	},
	DELETE: async(req,res) => {
		try {
				const data = req.body
				const deletedFor = await DeleteTrillerFor(data)
				const deleteMovie = await DeleteTriller(data)
				
				deleteFile(`/assets/${deleteMovie.triller_screen}`)
				deleteFile(`/assets/${deleteMovie.triller_thumnail_path}`)

				if (deleteMovie.movie_4k_is === true) {
					if (deleteMovie.movie_id === null) {
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_360p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_720p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_HD.mp4`)
					} else {
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_360p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_720p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_HD.mp4`)
					}
				} else {
					if (deleteMovie.movie_id !== null) {
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_HD.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_720p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_360p.mp4`)
					} else {
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_HD.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_720p.mp4`)
						deleteFile(`/assets/trillers/${deleteMovie.triller_path}_360p.mp4`)
					}
				}
				res.json({for: deletedFor, data: deleteMovie, error: null, status: 200})

			} catch (error) {
				res.status(404).json({data: null, error: error.message, status: '404'})
			}
	}
}
