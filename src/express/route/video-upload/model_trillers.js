const { fetch, fetchAll } = require('../../../lib/postgres')
const model = require('../recommended/model')


const READ_TRILLERS = `
SELECT
t.triller_id,
t.triller_name,
t.triller_name_ru,
t.triller_path,
m.movie_id,
m.movie_screen,
m.movie_thumnail_path,
m.movie_rate,
m.movie_premeire_date,
m.movie_genre,
m.movie_path,
m.movie_genre_ru,
m.movie_body,
m.movie_serial_is,
m.movie_body_ru,
m.movie_age,
c.country_id,
c.country_name,
c.country_name_ru,
cat.category_id,
cat.category_name,
cat.category_name_ru
FROM trillers t
natural join movies m
natural join movie_category m_c
LEFT JOIN  countries c ON c.country_id = m.movie_country
LEFT JOIN  categories cat ON cat.category_id = m_c.category_id
WHERE m_c.category_id = $1
`


const READ_TRILLER_ALL = `
SELECT
*
FROM trillers t
`


const READ_TRILLER_ONE = `
SELECT
	*
FROM trillers t
WHERE t.triller_id = $1
`

const READ_TRILLERS_SPECIAL = `
SELECT *
FROM movies
ORDER BY movie_name ASC
`


const DELETE = `
	DELETE FROM trillers WHERE triller_id = $1 RETURNING *
`
const DEL_TRILLER_FOR = `
	DELETE FROM recommended_trillers WHERE triller_id = $1 RETURNING *
`

const SELECT_TRILLER = `
	SELECT * FROM trillers
		WHERE triller_id = $1
`

const CREATE_TRILLER = `
insert into trillers (triller_path, triller_name, triller_name_ru, movie_id, triller_4k_is)
values ($1, $2, $3, $4, $5) returning *
`

const CREATE_TRILLER__NOT_MOVIE_ID = `
insert into trillers (
triller_path,
triller_name,
triller_name_ru,
triller_4k_is,
triller_thumnail_path,
triller_premeire_date,
triller_genre,
triller_genre_ru,
triller_body,
triller_body_ru,
triller_rate,
triller_country_id,
triller_screen,
triller_age,
movie_id)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning *
`


	const CREATE_TRILLER_GENRE = `
	insert into triller_genres (genre_id, triller_id)
	values ($1, $2)
	`
	
	const CREATE_TRILLER_CATEGORY = `
	insert into triller_category (category_id, triller_id)
	values ($1, $2)
	`
	
	const CREATE_TRILLER_ACTOR = `
	insert into triller_actors (actor_id, triller_id)
	values ($1, $2)
	`
	
	const CREATE_TRILLER_DIRECTOR = `
	insert into triller_directors (director_id, triller_id)
	values ($1, $2)
	`


	const DELETE_TRILLER_GENRE = `
	DELETE FROM triller_genres
		WHERE triller_id = $1 RETURNING *
	`
	
	const DELETE_TRILLER_CATEGORY = `
	DELETE FROM triller_category
		WHERE triller_id = $1 RETURNING *
	`
	
	const DELETE_TRILLER_ACTOR = `
	DELETE FROM triller_actors
		WHERE triller_id = $1 RETURNING *
	`
	
	const DELETE_TRILLER_DIRECTOR = `
	DELETE FROM triller_directors
		WHERE triller_id = $1 RETURNING *
	`




const ReadTriller = ({ categoryId }) => fetchAll(READ_TRILLERS, categoryId)

const ReadTrillerAll = () => fetchAll(READ_TRILLER_ALL)
const ReadTrillerOne = (id) => fetch(READ_TRILLER_ONE, id)

const ReadTrillerSpecial = () => fetchAll(READ_TRILLERS_SPECIAL)

const createGenre = (id, trId) => fetch(CREATE_TRILLER_GENRE, id, trId)

const createCat = (id, trId) => fetch(CREATE_TRILLER_CATEGORY, id, trId)

const createActor = (id, trId) => fetch(CREATE_TRILLER_ACTOR, id, trId)

const createDirec = (id, trId) => fetch(CREATE_TRILLER_DIRECTOR, id, trId)


const DeleteTriller = async({ id }) => {
	const triller = await fetch(SELECT_TRILLER, id)
	
	if(triller.movie_id === 'null') {
		await fetch(DELETE_TRILLER_GENRE, id)
		await fetch(DELETE_TRILLER_CATEGORY, id)
		await fetch(DELETE_TRILLER_ACTOR, id)
		await fetch(DELETE_TRILLER_DIRECTOR, id)
		return await fetch(DELETE, id)
	} else {
		await fetch(DELETE_TRILLER_GENRE, id)
		await fetch(DELETE_TRILLER_CATEGORY, id)
		await fetch(DELETE_TRILLER_ACTOR, id)
		await fetch(DELETE_TRILLER_DIRECTOR, id)
		const triller = await fetch(SELECT_TRILLER, id)
		return await fetch(DELETE, id)
	}	
}
const DeleteTrillerFor = async ({id}) => {
	return await fetch(DEL_TRILLER_FOR, id)
}

const CreateTriller = ({
	movieId,
	trillerPath,
	trillerName,
	trillerNameRu,
	video4K
}) => fetch(CREATE_TRILLER, trillerPath, trillerName, trillerNameRu, movieId, video4K)

const CreateTrillerNotMovieId = ({
	trillerPath,
	trillerName,
	trillerNameRu,
	video4K,
	trillerThubnail,
	videoPremeireDate,
	genreName,
	genreNameRu,
	trillerBody,
	trillerBodyRu,
	trillerRate,
	trillerCountryID,
	screenShot,
	movieAge,
	movieId
}) => fetch(CREATE_TRILLER__NOT_MOVIE_ID,
	trillerPath,
	trillerName,
	trillerNameRu,
	video4K,
	trillerThubnail,
	videoPremeireDate,
	genreName,
	genreNameRu,
	trillerBody,
	trillerBodyRu,
	trillerRate,
	trillerCountryID,
	screenShot,
	movieAge,
	movieId
)

module.exports = {
	ReadTrillerAll,
	DeleteTriller,
	ReadTriller,
	ReadTrillerSpecial,
	CreateTriller,
	CreateTrillerNotMovieId,
	createGenre,
	createCat,
	ReadTrillerOne,
	createActor,
	createDirec,
	DeleteTrillerFor
}
