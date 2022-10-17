const {
	ReadComments,
	CreateComment
} = require('./model')

module.exports = {
	GET: async(req, res) => {
		try {
			const data = req.query
			const response = await ReadComments(data)

			res.status(200).json({data: response, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	},
	POST: async(req, res) => {
		try {
			const data = req.body
			const newComment = await CreateComment(data)	
			res.status(200).json({data: newComment, error: null, status: '200'})
		} catch (error) {
			res.status(404).json({data: null, error: error.message, status: '404'})
		}
	}
}