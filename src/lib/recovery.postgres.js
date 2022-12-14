const { Pool } = require('pg')

const { PG } = require('../config')

const pool = new Pool({ connectionString: PG.connection, })

module.exports.fetch = async (SQL, ...params) => {
	const client = await pool.connect()
	try {
		const { rows: [row] } = await client.query(SQL, params.length ? params : null)
		return row
	}
	finally {
		client.release()
	}
}

module.exports.fetchAll = async (SQL, ...params) => {
	const client = await pool.connect()
	try {
		const { rows } = await client.query(SQL, params.length ? params : null)
		return rows
	}
	finally {
		client.release()
	}
}
