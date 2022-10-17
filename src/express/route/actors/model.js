const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_ACTORS = `
	SELECT
		*
	FROM actors a`

const READ_ACTOR_ONE = `SELECT * FROM actors a WHERE a.actor_id = $1`

const READ_ACTOR_BY_ID = `
SELECT *
FROM actors a
LEFT JOIN movie_actors m_a ON a.actor_id = m_a.actor_id
WHERE m_a.movie_id = $1
`

const CREATE_ACTOR = `
	insert into
		actors (actor_path, actor_name, actor_name_ru, actor_profession, actor_profession_ru)
	values ($1, $2, $3, $4, $5) returning *
`

const UPDATE_ACTOR = `
UPDATE actors
SET actor_path = $2,
    actor_name = $3,
    actor_name_ru = $4,
    actor_profession = $5,
    actor_profession_ru = $6
WHERE actor_id = $1
RETURNING *
`

const DELETE_DIRECTOR = `
DELETE FROM actors
WHERE actor_id = $1
RETURNING *
`



const ReadActor = () => fetchAll(READ_ACTORS)

const ReadActorOne = ({ id }) => fetch(READ_ACTOR_ONE, id)

const ReadActorById = ({ movieId }) => fetchAll(READ_ACTOR_BY_ID, movieId)


const CreateActor = ({
	actorPath,
	actorName,
	actorNameRu,
	actorProfession,
	actorProfessionRu
}) => fetch(CREATE_ACTOR, actorPath, actorName, actorNameRu, actorProfession, actorProfessionRu)


const UpdateActor = ({
	id,
	actorPath,
	actorName,
	actorNameRu,
	actorProfession,
	actorProfessionRu
 }) => fetch(UPDATE_ACTOR, id, actorPath, actorName, actorNameRu, actorProfession, actorProfessionRu)

const DeleteActor = ({ id }) => fetch(DELETE_DIRECTOR, id)


module.exports = {
	ReadActor,
	ReadActorById,
	CreateActor,
	ReadActorOne,
	UpdateActor,
	DeleteActor
}