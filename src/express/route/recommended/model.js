const { fetch, fetchAll } = require('../../../lib/postgres')


const READ_RECOMMENDED_T = `
SELECT
*
FROM recommended_trillers r_t
LEFT JOIN trillers t ON r_t.triller_id = t.triller_id
ORDER BY t.triller_name ASC
OFFSET 0 ROWS FETCH FIRST 150 ROWS ONLY
`

const READ_RECOMMENDED_T_MOVIES = `
SELECT
*
FROM movies r_t
WHERE r_t.movie_id = $1
ORDER BY t.triller_name ASC
OFFSET 0 ROWS FETCH FIRST 150 ROWS ONLY
`

const CREATE_RECOMMENDED_T = `
insert into recommended_trillers (triller_id)
values ($1) returning *
`

const DELETE_RECOMMENDED_T = `
DELETE FROM recommended_trillers
WHERE recommended_triller_id = $1
returning *
`

const READ_RECOMMENDED_M = `
SELECT
m.movie_body,
m.movie_body_ru,
m.movie_genre,
m.movie_genre_ru,
m.movie_id,
m.movie_name,
m.movie_name_ru,
m.movie_serial_is,
m.movie_premeire_date,
m.movie_rate,
m.movie_path,
m.movie_screen,
m.movie_thumnail_path,
c.country_id,
c.country_name,
c.country_name_ru,
r_m.recommended_movie_id
FROM recommended_movies r_m
LEFT JOIN movies m ON m.movie_id = r_m.movie_id
LEFT JOIN countries c ON c.country_id = m.movie_country
ORDER BY m.movie_name ASC
`



const CREATE_RECOMMENDED_M = `
insert into recommended_movies (movie_id)
values ($1) returning *
`

const DELETE_RECOMMENDED_M = `
DELETE FROM recommended_movies
WHERE recommended_movie_id = $1
returning *
`

const ReadRTriller = () => fetchAll(READ_RECOMMENDED_T)
const ReadRTrillerMovies = (movie_id) => fetchAll(READ_RECOMMENDED_T_MOVIES, movie_id)
const CreateRTriller = (trillerId) => fetchAll(CREATE_RECOMMENDED_T, trillerId)
const DeleteRTriller = ({ rTrillerId }) => fetch(DELETE_RECOMMENDED_T, rTrillerId)

const ReadRMovie = () => fetchAll(READ_RECOMMENDED_M)
const CreateRMovie = (movieId) => fetchAll(CREATE_RECOMMENDED_M, movieId)
const DeleteRMovie = ({ rMovieId }) => fetch(DELETE_RECOMMENDED_M, rMovieId)

module.exports = {
	ReadRTriller,
	CreateRTriller,
	DeleteRTriller,
	ReadRTrillerMovies,
	ReadRMovie,
	CreateRMovie,
	DeleteRMovie,
}