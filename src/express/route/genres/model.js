const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_GENRES = `
SELECT 
*
FROM genres g`

const READ_GENRE_ONE = `
SELECT 
*
FROM genres WHERE genre_id = $1`

const CREATE_GENRE = `
insert into
genres (genre_name, genre_name_ru)
values ($1, $2) RETURNING *
`

const UPDATE_GENRE = `
UPDATE genres
SET genre_name = $2,
    genre_name_ru = $3
WHERE genre_id = $1
RETURNING *
`

const DELETE_GENRE = `
DELETE FROM genres
WHERE genre_id = $1
RETURNING *
`

const ReadGenre = () => fetchAll(READ_GENRES)
const ReadGenreOne = ({ id }) => fetch(READ_GENRE_ONE, id)
const CreateGenre = ({ genreName, genreNameRu }) => fetch(CREATE_GENRE, genreName, genreNameRu)
const UpdateGenre = ({ id, genreName, genreNameRu }) => fetch(UPDATE_GENRE, id, genreName, genreNameRu)
const DeleteGenre = ({ id }) => fetch(DELETE_GENRE, id)

module.exports = {
	CreateGenre,
	ReadGenre,
	ReadGenreOne,
	UpdateGenre,
	DeleteGenre
}
