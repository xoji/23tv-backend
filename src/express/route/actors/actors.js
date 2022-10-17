const fs = require('fs')
const { deleteFile } = require('../../../utils')
const {
	ReadActor,
	ReadActorById,
	CreateActor,
	ReadActorOne,
	UpdateActor,
	DeleteActor
} = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const actors = await ReadActor()
			res.json({ data: actors, error: null, status: 200 })
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_BY_ID: async(req, res) => {
		try {
			const language = req.headers.language
			const response = []
			const actors = await ReadActorById(req.query)
			for(let i of actors) {
				response.push({
					actor_id: i.actor_id,
					actor_name: (language === 'uz') ? i.actor_name : i.actor_name_ru,
					actor_profession: (language === 'uz') ? i.actor_profession : i.actor_profession_ru,
					actor_path: i.actor_path
				})
			}
			res.json({data: language ? response : actors, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ONE: async(req, res) => {
		try {
			const actor = await ReadActorOne(req.query)
			res.json({data: actor, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req,res) => {
		try {
			const file = req.files.file
			const { actorNameUz, actorNameRu, actorProfessionUz = null, actorProfessionRu = null } = req.body
			const path = `actors&directors/${new Date().getTime()}-${file.name}`

			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log(`Actor picture Uploaded successfully`)
			})
			
			const data = {
				actorPath: path,
				actorName: actorNameUz,
				actorNameRu: actorNameRu,
				actorProfession: actorProfessionUz,
				actorProfessionRu: actorProfessionRu
			}

			const newActor = await CreateActor(data)
			res.json({data: newActor, error: null, status: 200})

		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	UPDATE: async(req,res) => {
		try {
			const { id, actorName, actorNameRu, oldPath, actorProfession, actorProfessionRu } = req.body
			const file = req.files.file
			const path = `actors&directors/${new Date().getTime()}-${file.name}`
			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log(`Actor picture Uploaded successfully`)
			})
			const data = {
				id,
				actorName,
				actorNameRu,
				actorProfession,
				actorProfessionRu,
				actorPath: path
			}
			const updateActor = await UpdateActor(data)
			if (!updateActor) throw Error
				deleteFile(`/assets/${oldPath}`)
			res.json({data: updateActor, error: null, status: 200})

		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req,res) => {
		try {
			const data = req.body
			const deleteActor = await DeleteActor(data)
			deleteFile(`/assets/${deleteActor.actor_path}`)
			res.json({data: deleteActor, error: null, status: 200})

		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	}
}