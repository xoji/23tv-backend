	const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_HISTORY_MOVIES = `
SELECT 
*
FROM histories h
LEFT JOIN movies m ON m.movie_id = h.movie_id
LEFT JOIN  countries c ON c.country_id = m.movie_country
WHERE h.user_id = $1
`

const READ_HISTORY_MOVIE_ONE = `
SELECT 
*
FROM histories h
WHERE h.user_id = $1 AND h.movie_id = $2
`

const CREATE_HISTORY_MOVIE = `
insert into
histories (user_id, movie_id)
values ($1, $2) RETURNING *
`

const DELETE_HISTORY_MOVIE = `
DELETE FROM histories
WHERE movie_id = $1 AND user_id = $2
RETURNING *
`

const ReadHistoryMovie = ({ id }) => fetchAll(READ_HISTORY_MOVIES, id)
const ReadHistoryMovieOne = ({ userId, movieId }) => fetch(READ_HISTORY_MOVIE_ONE, userId, movieId)
const CreateHistoryMovie = ({ userId, movieId }) => fetch(CREATE_HISTORY_MOVIE, userId, movieId)


module.exports = {
	ReadHistoryMovie,
	ReadHistoryMovieOne,
	CreateHistoryMovie,
}