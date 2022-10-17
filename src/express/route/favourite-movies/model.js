const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_FAVOURITE_MOVIES = `
SELECT 
*
FROM favourite_movies f_m
LEFT JOIN movies m ON m.movie_id = f_m.movie_id
LEFT JOIN  countries c ON c.country_id = m.movie_country
WHERE f_m.user_id = $1
`

const READ_FAVOURITE_MOVIE_ONE = `
SELECT 
*
FROM favourite_movies f_m
WHERE f_m.user_id = $1 AND f_m.movie_id = $2
`

const CREATE_FAVOURITE_MOVIE = `
insert into
favourite_movies (user_id, movie_id)
values ($1, $2) RETURNING *
`

const DELETE_FAVOURITE_MOVIE = `
DELETE FROM favourite_movies
WHERE movie_id = $1 AND user_id = $2
RETURNING *
`

const ReadFavouriteMovie = ({ id }) => fetchAll(READ_FAVOURITE_MOVIES, id)
const ReadFavouriteMovieOne = ({ userId, movieId }) => fetch(READ_FAVOURITE_MOVIE_ONE, userId, movieId)
const CreateFavouriteMovie = ({ userId, movieId }) => fetch(CREATE_FAVOURITE_MOVIE, userId, movieId)
const DeleteFavouriteMovie = ({ movieId, userId }) => fetch(DELETE_FAVOURITE_MOVIE, movieId, userId)

module.exports = {
	ReadFavouriteMovie,
	ReadFavouriteMovieOne,
	CreateFavouriteMovie,
	DeleteFavouriteMovie
}