const {
	CreateAdmin,
	ReadADMIN
} = require('./model')
const sha1 = require('sha1')
const { sign, verify } = require('../../../lib/jwt')


module.exports = {
	GET: async(req, res) => {
		try {
			const data = verify(req.headers.authorizetion)
			const user = await ReadADMIN(data)
			if (!user) {
				throw error
			}
			const result = {
				id: user.admin_id,
				username: user.admin_username,
				status: user.admin_status
			}
			res.status(200).json({ data: result, is_admin: true, status: 200 })
		} catch (error) {
			res.status(400).json({ error: error.message, token: null, status: 400 })
		}
	},
	POST_LOGIN: async(req, res) => {
		const data = req.body
		try {
			const user = await ReadADMIN({ username: data.username, password: sha1(data.password)})
			const payload = {
				id: user.admin_id,
				username: user.admin_username,
				password: user.admin_password,
				status: user.admin_status
			}
			res.status(200).json({ token: sign(payload), is_admin: true, status: 200 })
		} catch (error) {
			res.status(400).json({ error: error.message, token: null, status: 400 })
		}
	}
}