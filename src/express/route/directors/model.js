const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_DIRECTORS = `
	SELECT
		*
	FROM directors d`

const READ_DIRECTOR_ONE = `
	SELECT * FROM directors d WHERE d.director_id = $1`

const READ_DIRECTOR_BY_ID = `
	SELECT *
	FROM directors d
	LEFT JOIN movie_directors m_d ON d.director_id = m_d.director_id
	WHERE m_d.movie_id = $1
`

const CREATE_DIRECTOR = `
	insert into
		directors (director_path, director_name, director_name_ru, director_profession, director_profession_ru)
	values ($1, $2, $3, $4, $5) returning *
`

const UPDATE_DIRECTOR = `
UPDATE directors
SET director_path = $2,
    director_name = $3,
    director_name_ru = $4,
    director_profession = $5,
    director_profession_ru = $6
WHERE director_id = $1
RETURNING *
`

const DELETE_DIRECTOR = `
DELETE FROM directors
WHERE director_id = $1
RETURNING *
`


const ReadDirector = () => fetchAll(READ_DIRECTORS)

const ReadDirectorOne = ({ id }) => fetch(READ_DIRECTOR_ONE, id)

const ReadDirectorById = ({ movieId }) => fetchAll(READ_DIRECTOR_BY_ID, movieId)

const CreateDirector = ({
	directorPath,
	directorName,
	directorNameRu,
	directorProfession,
	directorProfessionRu
}) => fetch(CREATE_DIRECTOR, directorPath, directorName, directorNameRu, directorProfession,directorProfessionRu)

const UpdateDirector = ({
	id,
	directorPath,
	directorName,
	directorNameRu,
	directorProfession,
	directorProfessionRu
 }) => fetch(UPDATE_DIRECTOR, id, directorPath, directorName, directorNameRu, directorProfession, directorProfessionRu)

const DeleteDirector = ({ id }) => fetch(DELETE_DIRECTOR, id)


module.exports = {
	ReadDirectorById,
	ReadDirector,
	ReadDirectorOne,
	CreateDirector,
	UpdateDirector,
	DeleteDirector
}