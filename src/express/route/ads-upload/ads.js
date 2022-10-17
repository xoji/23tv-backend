const fs = require('fs')
const { deleteFile } = require('../../../utils')
const { ReadADSAll, ReadADS, CreateADS, ReadADSOne, DeleteADS, UpdateADS } = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const ads = await ReadADSAll()
			res.json({data: ads, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_ONE: async(req, res) => {
		try {
			const ads = await ReadADSOne(req.query)
			res.json({data: ads, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	GET_RANDOM_ONE: async(req, res) => {
		try {
			const ads = await ReadADS()
			res.json({data: ads, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req,res) => {
		try {
			const file = req.files.file
			const { adsName, link } = req.body
			const path = `ads/${new Date().getTime()}-${file.name}`
			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log('ADS uploaded successfully')
				const newAds = await CreateADS(path, link)
				res.json({data: newAds, error: null, status: 200})
			})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	UPDATE: async(req,res) => {
		try {
			const file = req.files.file
			const { adsName, link, oldFile, id } = req.body
			const path = `ads/${new Date().getTime()}-${file.name}`
			file.mv(`./src/assets/${path}`, async function (err) {
				if (err) return res.sendStatus(500).send(err)
					console.log('ADS updated successfully')
			})
			const data = {
				id,
				path,
				link
			}
			const updateAds = await UpdateADS(data)
			deleteFile(`/assets/${oldFile}`)
			res.json({data: updateAds, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	DELETE: async(req,res) => {
		try {
			const data = req.body
			const deleteAds = await DeleteADS(data)
			deleteFile(`/assets/${deleteAds.ads_path}`)
			res.json({data: deleteAds, error: null, status: 200})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
}