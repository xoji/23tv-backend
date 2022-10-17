const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_SERIALS = `
SELECT
m_s.movie_serial_id,
m_s.movie_name,
m_s.movie_name_ru,
m_s.movie_path,
m_s.movie_length,
m_s.movie_4k_is,
m_s.movie_id,
m_s.season_id,
m.movie_thumnail_path,
m.movie_premeire_date,
m.movie_body,
m.movie_body_ru,
m.movie_rate,
m.movie_genre,
m.movie_genre_ru,
m.movie_screen,
m.movie_age,
m.movie_serial_is,
m_s.movie_serial_id
FROM movie_serials m_s
LEFT JOIN movies m ON m.movie_id = m_s.movie_id
WHERE m_s.movie_id = $1
`

const READ_SERIAL = `
SELECT
m_s.movie_serial_id,
m_s.movie_name,
m_s.movie_name_ru,
m_s.movie_path,
m_s.movie_length,
m_s.movie_4k_is,
m_s.movie_id,
m.movie_thumnail_path,
m.movie_premeire_date,
m.movie_body,
m.movie_body_ru,
m.movie_rate,
m.movie_genre,
c.country_id,
c.country_name,
c.country_name_ru,
m.movie_genre_ru,
m.movie_screen,
m.movie_age,
m.movie_serial_is,
m_s.movie_serial_id
FROM movie_serials m_s
LEFT JOIN movies m ON m.movie_id = m_s.movie_id
LEFT JOIN  countries c ON c.country_id = m.movie_country
WHERE m_s.movie_serial_id = $1
`


const CREATE_SERIAL = `
insert into movie_serials (movie_name, movie_name_ru, movie_path, movie_4k_is, movie_id, movie_length, season_id)
values ($1, $2, $3, $4, $5, $6, $7) returning *
`

const ReadSerial = ({ movieId }) => fetchAll(READ_SERIALS, movieId)

const ReadSerialOne = ({ movieId }) => fetch(READ_SERIAL, movieId)

const createSerial = ({ videoLength, movieId, video4K, videoPath, videoName, videoNameRu, season_id}) =>
fetch(CREATE_SERIAL, videoName, videoNameRu, videoPath, video4K, movieId, videoLength, season_id)

module.exports = {
	ReadSerial,
	createSerial,
	ReadSerialOne
}