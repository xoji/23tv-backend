const { fetch, fetchAll } = require("../../../lib/postgres");
const fs = require("fs");
const { deleteFile } = require("../../../utils");

const READ_VIDEOS = `
SELECT
m.movie_id,
m.movie_thumnail_path,
m.movie_name,
m.movie_name_ru,
m.movie_body,
m.movie_age,
m.movie_body_ru,
m.movie_genre,
m.movie_genre_ru,
m.movie_serial_is,
c.country_id,
c.country_name,
c.country_name_ru,
cat.category_id
FROM movies m
NATURAL JOIN movie_category cat
LEFT JOIN  countries c ON c.country_id = m.movie_country
`;

const READ_HASHTAG = `
SELECT
m.movie_unique_name
FROM movies m
GROUP BY m.movie_unique_name
`;

const READ_VIDEO_YEAR = `
SELECT
m.movie_premeire_date as year
FROM movies m
GROUP BY m.movie_premeire_date
ORDER BY m.movie_premeire_date
`;

const READ_VIDEO_ALL = `
SELECT
*
FROM movies m
ORDER BY m.movie_name ASC
`;

const READ_VIDEO_ALL_SERIALS = `
SELECT
*
FROM movies m
WHERE m.movie_serial_is = TRUE
ORDER BY m.movie_name ASC
`;

const READ_VIDEO_ONE = `
SELECT
m.movie_id,
m.movie_thumnail_path,
m.movie_name,
m.movie_name_ru,
m.movie_body,
m.movie_age,
m.movie_body_ru,
m.movie_rate,
m.movie_length,
m.movie_path,
m.movie_4k_is,
m.serial_count,
m.movie_genre,
m.movie_genre_ru,
m.movie_serial_is,
m.movie_screen,
m.movie_premeire_date,
m.movie_serial_is,
m.paid,
c.country_id,
c.country_name,
c.country_name_ru,
cat.category_id,
cat.category_name,
cat.category_name_ru
FROM movies m
LEFT JOIN  countries c ON c.country_id = m.movie_country
LEFT JOIN  movie_category m_cat ON m_cat.movie_id = m.movie_id
LEFT JOIN  categories cat ON cat.category_id = m_cat.category_id
WHERE m.movie_id = $1
ORDER BY random()
`;

const READ_VIDEO_SEARCH_INGINE = `
SELECT
m.movie_id,
m.movie_name,
m.movie_name_ru,
m.movie_thumnail_path,
m.movie_premeire_date,
m.movie_body,
m.movie_age,
m.movie_body_ru,
m.movie_rate,
m.movie_length,
m.movie_genre,
m.movie_genre_ru,
m.movie_serial_is,
m.movie_4k_is,
m.hidden,
cat.category_id,
cat.category_name,
cat.category_name_ru
FROM movies m
LEFT JOIN  movie_category m_cat ON m_cat.movie_id = m.movie_id
LEFT JOIN  categories cat ON cat.category_id = m_cat.category_id
WHERE LOWER(m.movie_name) LIKE $1 OR LOWER(m.movie_name_ru) LIKE $1
`;

const READ_VIDEO_KEY_UP = `
SELECT
*
FROM movies m
WHERE LOWER(m.movie_name) LIKE $1 OR LOWER(m.movie_name_ru) LIKE $1
`;

const CREATE_VIDEO = `
insert into movies (
	movie_path,
	movie_thumnail_path,
	movie_country,
	movie_name,
	movie_name_ru,
	movie_premeire_date,
	movie_body,
	movie_body_ru,
	movie_rate,
	movie_length,
	movie_4k_is,
	movie_genre,
	movie_genre_ru,
	movie_screen,
	movie_serial_is,
	movie_age,
	serial_count,
	movie_unique_name,
	movie_actors,
	movie_actors_ru,
	movie_directors,
	movie_directors_ru, 
	is_national)
	values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) returning *
	`;

const UPDATE_VIDEO = `
	UPDATE movies
	SET movie_thumnail_path = $1,
	movie_country = $2,
	movie_name = $3,
	movie_name_ru = $4,
	movie_premeire_date = $5,
	movie_body = $6,
	movie_body_ru = $7,
	movie_rate = $8,
	movie_4k_is = $9,
	movie_screen = $11
	WHERE movie_id = $10
	RETURNING *
	`;

const CREATE_VIDEO_GENRE = `
	insert into movie_genres (genre_id, movie_id)
	values ($1, $2)
	`;

const CREATE_VIDEO_CATEGORY = `
	insert into movie_category (category_id, movie_id)
	values ($1, $2)
	`;

const CREATE_VIDEO_ACTOR = `
	insert into movie_actors (actor_id, movie_id)
	values ($1, $2)
	`;

const CREATE_VIDEO_DIRECTOR = `
	insert into movie_directors (director_id, movie_id)
	values ($1, $2)
	`;

const DELETE_VIDEO = `DELETE FROM movies
	WHERE movie_id = $1
	RETURNING *`;

const ReadVideo = () => fetchAll(READ_VIDEOS);

const ReadVideoAll = () => fetchAll(READ_VIDEO_ALL);

const ReadVideoAllSerials = () => fetchAll(READ_VIDEO_ALL_SERIALS);

const ReadVideoYear = () => fetchAll(READ_VIDEO_YEAR);

const ReadVideoOne = ({ movieId }) => fetch(READ_VIDEO_ONE, movieId);

const ReadVideoSearchIngine = ({ searchValue }) =>
  fetchAll(READ_VIDEO_SEARCH_INGINE, `${searchValue}%`);

const ReadVideoFilter = ({ year, genreId, countryId }) =>
  fetchAll(READ_VIDEO_FILTER, genreId, countryId, year);

const ReadVideoFilterWithCat = ({ year, genreId, countryId }) =>
  fetchAll(READ_VIDEO_FILTER_WITH_CAT, genreId, countryId, year);

const CreateVideo = ({
  videoCountry,
  videoPath,
  videoThubnail,
  videoName,
  videoNameRu,
  videoPremeireDate,
  videoBody,
  videoBodyRu,
  videoRate,
  videoLength,
  video4K,
  is_national,
  genreName,
  genreNameRu,
  screenShot,
  serialIs,
  movieAge,
  hashtag,
  serialCount,
  actorNames,
  actorNamesRu,
  directorNames,
  directorNamesRu,
}) =>
  fetch(
    CREATE_VIDEO,
    videoPath,
    videoThubnail,
    videoCountry,
    videoName,
    videoNameRu,
    videoPremeireDate,
    videoBody,
    videoBodyRu,
    videoRate,
    videoLength,
    video4K,
    genreName,
    genreNameRu,
    screenShot,
    serialIs,
    movieAge,
    serialCount,
    hashtag,
    actorNames,
    actorNamesRu,
    directorNames,
    directorNamesRu,
    is_national
  );

const UpdateMovie = (
  command,
  {
    id,
    videoCountry,
    videoPremeireDate,
    videoBody,
    videoBodyRu,
    videoRate,
    video4K,
    videoName,
    videoNameRu,
    videoThubnail,
    screenShot,
  }
) => fetch(command);

const createVideoGenre = (genreId, movieId) =>
  fetch(CREATE_VIDEO_GENRE, genreId, movieId);

const createVideoCategory = (categoryId, movieId) =>
  fetch(CREATE_VIDEO_CATEGORY, categoryId, movieId);

const createVideoActor = (actorId, movieId) =>
  fetch(CREATE_VIDEO_ACTOR, actorId, movieId);

const createVideoDirector = (directorId, movieId) =>
  fetch(CREATE_VIDEO_DIRECTOR, directorId, movieId);

const DeleteMovie = async ({ id }) => {
  const deleteActor = await fetch(
    `DELETE FROM movie_actors WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteDirector = await fetch(
    `DELETE FROM movie_directors WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteCategory = await fetch(
    `DELETE FROM movie_category WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteGenre = await fetch(
    `DELETE FROM movie_genres WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteSerials = await fetch(
    `DELETE FROM movie_serials WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteRecommendedMovie = await fetch(
    `DELETE FROM recommended_movies WHERE movie_id = $1 RETURNING *`,
    id
  );
  const deleteFavoriteMovie = await fetch(
    `DELETE FROM favourite_movies WHERE movie_id = $1 RETURNING *`,
    id
  );
  const delete_comments = await fetch(
    `DELETE FROM comments WHERE movie_id = $1 RETURNING *`,
    id
  );
  const delete_histories = await fetch(
    `DELETE FROM histories WHERE movie_id = $1 RETURNING *`,
    id
  );

  const selectTrillers = await fetchAll(
    `SELECT * FROM trillers WHERE movie_id = $1`,
    id
  );

  for (let i of selectTrillers) {
    if (i && i.triller_id) {
      const deleteTrillerActor = await fetch(
        `
						DELETE FROM triller_actors WHERE triller_id = $1 RETURNING *`,
        i.triller_id
      );

      const deleteTrillerDirector = await fetch(
        `
						DELETE FROM triller_directors WHERE triller_id = $1 RETURNING *`,
        i.triller_id
      );

      const deleteTrillerCategory = await fetch(
        `
						DELETE FROM triller_category WHERE triller_id = $1 RETURNING *`,
        i.triller_id
      );

      const deleteTrillerGenre = await fetch(
        `
						DELETE FROM triller_genres WHERE triller_id = $1 RETURNING *`,
        i.triller_id
      );

      const deleteTrillerRecommendedTriller = await fetch(
        `
						DELETE FROM recommended_trillers WHERE triller_id = $1 RETURNING *`,
        i.triller_id
      );
    }
  }

  const deleteTriller = await fetch(
    `DELETE FROM trillers WHERE movie_id = $1 RETURNING *`,
    id
  );

  if (deleteTriller && deleteTriller.triller_4k_is === true) {
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}.mp4`);
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_360p.mp4`);
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_720p.mp4`);
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_HD.mp4`);
  } else if (deleteTriller && deleteTriller.triller_4k_is === false) {
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_HD.mp4`);
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_720p.mp4`);
    deleteFile(`/assets/trillers/${deleteTriller.triller_path}_360p.mp4`);
  }

  const deleteMovie = await fetch(DELETE_VIDEO, id);
  return deleteMovie;
};

const FILTER_NAME_TRUE = `
			SELECT * FROM movies m
			WHERE m.is_national IS TRUE AND (lower(m.movie_name) LIKE lower($1) OR lower(m.movie_name_ru) LIKE lower($1)) 
			;
		`;
const FILTER_NAME_FALSE = `
			SELECT * FROM movies m
			WHERE m.is_national IS NOT TRUE AND (lower(m.movie_name) LIKE lower($1) OR lower(m.movie_name_ru) LIKE lower($1)) 
			;
		`;
const FILTER_GEN = `
		SELECT
		*
		FROM movies m
		NATURAL JOIN movie_genres m_g
		WHERE m_g.genre_id = $1
		`;

const FILTER_COUNTRY = `
		SELECT
		*
		FROM movies m
		LEFT JOIN  countries c ON c.country_id = m.movie_country
		WHERE c.country_id = $1
		`;

const FILTER_YEAR = `
		SELECT
		*
		FROM movies m
		WHERE m.movie_premeire_date = $1
		`;
const HIDE_VIDEO = `
		UPDATE movies SET hidden = $2 WHERE movie_id = $1
		`;

const SET_PAID = `
		UPDATE movies SET paid = $2 WHERE movie_id = $1
		`;

const GET_USER = `
		SELECT * FROM users WHERE user_id = $1
		`;
const GET_TRANSACTION = `
		SELECT * FROM inner_transactions WHERE user_id = $1 AND year = $2 ORDER BY timestamp DESC LIMIT 1
		`;

const FilterName = (search, is_national) =>
  is_national
    ? fetchAll(FILTER_NAME_TRUE, `%${search}%`)
    : fetchAll(FILTER_NAME_FALSE, `%${search}%`);
const FilterGen = (i) => fetchAll(FILTER_GEN, i);
const FilterCountry = (i) => fetchAll(FILTER_COUNTRY, i);

const FilterYear = (i) => fetchAll(FILTER_YEAR, i);

const MovieHashtag = () => fetchAll(READ_HASHTAG);

const ReadVideoOnKeyUp = ({ searchValue }) =>
  fetchAll(READ_VIDEO_KEY_UP, `${searchValue}%`);

const HideVideo = (movie_id, value) => fetch(HIDE_VIDEO, movie_id, value);

const SetPayment = (movie_id, value) => fetch(SET_PAID, movie_id, value);

const GetUser = (userId) => fetch(GET_USER, userId);

const GetTransaction = (user_id, year) => fetch(GET_TRANSACTION, user_id, year);

module.exports = {
  FilterName,
  FilterGen,
  FilterCountry,
  ReadVideoOnKeyUp,
  FilterYear,
  MovieHashtag,
  ReadVideo,
  ReadVideoAll,
  ReadVideoFilterWithCat,
  ReadVideoAllSerials,
  ReadVideoYear,
  ReadVideoFilter,
  ReadVideoOne,
  ReadVideoSearchIngine,
  CreateVideo,
  createVideoGenre,
  createVideoCategory,
  createVideoActor,
  createVideoDirector,
  DeleteMovie,
  UpdateMovie,
  HideVideo,
  SetPayment,
  GetUser,
  GetTransaction,
};
