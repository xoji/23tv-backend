const fs = require('fs')
const { getFileFormat } = require('../../../config.js')
const { deleteFile } = require('../../../utils/index.js')
const {
	ReadDirector,
	ReadDirectorById,
	CreateDirector,
	ReadDirectorOne,
	UpdateDirector,
	DeleteDirector
} = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const directors = await ReadDirector()
			res.json({data: directors, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_BY_ID: async(req, res) => {
		try {
			const language = req.headers.language
			const response = []
			const directors = await ReadDirectorById(req.query)
			for(let i of directors) {
				response.push({
					director_id: i.director_id,
					director_name: (language === 'uz') ? i.director_name : i.director_name_ru,
					director_profession: (language === 'uz') ? i.director_profession : i.director_profession_ru,
					director_path: i.director_path
				})
			}
			res.json({data: language ? response : directors, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ONE: async(req, res) => {
		try {
			const director = await ReadDirectorOne(req.query)
			res.json({data: director, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req,res) => {
		try {
			const file = req.files.file
			const { 
				directorNameUz,
				directorNameRu,
				directorProfessionUz = null,
				directorProfessionRu = null
			} = req.body

			const path = `actors&directors/${new Date().getTime()}-${file.name}`

			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log(`Director picture Uploaded successfully`)
			})
			const data = {
				directorPath: path,
				directorName: directorNameUz,
				directorNameRu: directorNameRu,
				directorProfession: directorProfessionUz, 
				directorProfessionRu: directorProfessionRu,
			}
			const newDirector = await CreateDirector(data)
			res.json({data: newDirector, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	UPDATE: async(req,res) => {
		try {
			const { id, directorName, directorNameRu, oldPath, directorProfession, directorProfessionRu } = req.body
			const file = req.files.file
			const path = `actors&directors/${new Date().getTime()}-${file.name}`
			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log(`Actor picture Uploaded successfully`)
			})
			const data = {
				id,
				directorName,
				directorNameRu,
				directorProfession,
				directorProfessionRu,
				directorPath: path
			}
			const updateDirector = await UpdateDirector(data)
			if (!updateDirector) throw Error
			deleteFile(`/assets/${oldPath}`)
			res.json({data: updateDirector, error: null, status: 200})

		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req,res) => {
		try {
			const data = req.body
			const deleteDirector = await DeleteDirector(data)
			deleteFile(`/assets/${deleteDirector.director_path}`)
			res.json({data: deleteDirector, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	}
}