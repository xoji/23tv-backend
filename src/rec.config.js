const ipapi = require('ipapi.co')

module.exports = {
	FETCH: {
		user: 2,
		post: 10,
	},
	PG: {
		connection: 'postgres://postgres:postgres@localhost:5432/tv23',
		connectionString:  '',
		host: 'localhost',
		user: 'postgres',
		password: '1',
		port: 5432,
		database: 'tv23',
	},
	JWT: {
		SECRET: 'SECRET',
		EXPIRES_IN: 7200 * 12 * 7,
	},
	getFileFormat: (path) => {
		var basename = path.split(/[\\/]/).pop(),
		pos = basename.lastIndexOf(".")
		if (basename === "" || pos < 1)
			return ""
		return basename.slice(pos)
	},
	generateCode: (n) => {
		let s="", a=1
		while(a<=n){
			s+=Math.floor((Math.random()*1000)%10).toString()
			a++
		}
		return s
	},
	cors: function() {
		return function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*")
			res.header("Access-Control-Allow-Headers", "X-Requested-With")
			next()
		}
	},
	getLocationApi: function(res) {
		
	}
}