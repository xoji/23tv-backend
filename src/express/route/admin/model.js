const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_ADMIN = `
	SELECT *
	FROM admins a
	WHERE a.admin_username = $1 AND a.admin_password = $2
`

const CREATE_ADMIN = `
	insert into admins
	(admin_username, admin_password, admin_status)
	values ($1, $2, $3) returning *
`

const ReadADMIN = ({ username, password }) => fetch(READ_ADMIN, username, password)
const CreateAdmin = ({username, password, status}) => fetch(CREATE_ADMIN, username, password, status)

module.exports = {
	CreateAdmin,
	ReadADMIN,
}