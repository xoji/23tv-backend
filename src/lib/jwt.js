const { verify, sign } =  require('jsonwebtoken')
const { JWT } = require('../config')

module.exports = {
	sign: (payload) => sign(payload, JWT.SECRET),
	// sign: (payload, expiresIn = JWT.EXPIRES_IN) => sign(payload, JWT.SECRET, { expiresIn }),
	verify: accessToken => verify(accessToken, JWT.SECRET)
}
