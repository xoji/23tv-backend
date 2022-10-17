const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_ADS_ALL = `SELECT * FROM ads`

const READ_ADS = `SELECT * FROM ads ORDER BY random()`

const READ_ADS_ONE = `SELECT * FROM ads WHERE ads_id = $1`

const CREATE_ADS = `
	insert into
		ads (ads_path, ads_link)
	values ($1, $2) returning * 
`

const UPDATE_ADS = `
UPDATE ads
SET ads_path = $2,
    ads_link = $3
WHERE ads_id = $1
RETURNING *
`

const DELETE_ADS = `
DELETE FROM ads
WHERE ads_id = $1
RETURNING *
`

const ReadADSAll = () => fetchAll(READ_ADS_ALL)
const ReadADS = () => fetch(READ_ADS)
const ReadADSOne = ({ id }) => fetch(READ_ADS_ONE, id)
const CreateADS = (path, link) => fetch(CREATE_ADS, path, link)
const UpdateADS = ({ id, path, link }) => fetch(UPDATE_ADS, id, path, link)
const DeleteADS = ({ id }) => fetch(DELETE_ADS, id)

module.exports = {
	ReadADS,
	ReadADSAll,
	CreateADS,
	ReadADSOne,
	UpdateADS,
	DeleteADS
}