const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_COUNTRIES = `
SELECT
*
FROM countries c`

const READ_COUNTRY_ONE = `
SELECT
*
FROM countries c WHERE c.country_id = $1`

const CREATE_COUNTRY = `
insert into
countries (country_name, country_name_ru)
values ($1, $2) RETURNING *
`

const UPDATE_COUNTRY = `
UPDATE countries
SET country_name = $2,
    country_name_ru = $3
WHERE country_id = $1
RETURNING *
`

const DELETE_COUNTRY = `
DELETE FROM countries
WHERE country_id = $1
RETURNING *
`

const ReadCountry = () => fetchAll(READ_COUNTRIES)
const ReadCountryOne = ({ id }) => fetch(READ_COUNTRY_ONE, id)
const CreateCountry = ({ countryName, countryNameRu }) => fetch(CREATE_COUNTRY, countryName, countryNameRu)
const UpdateCountry = ({ id, countryName, countryNameRu }) => fetch(UPDATE_COUNTRY, id, countryName, countryNameRu)
const DeleteCountry = ({ id }) => fetch(DELETE_COUNTRY, id)

module.exports = {
	CreateCountry,
	ReadCountry,
	ReadCountryOne,
	UpdateCountry,
	DeleteCountry
}