const { fetch, fetchAll } = require('../../../lib/postgres')

const READ_COMMENTS = `
SELECT
u.user_id,
c.comment_id,
c.comment_body,
c.movie_id,
c.created_at,
u.user_username,
u.user_path
FROM comments c
NATURAL JOIN users u
WHERE c.movie_id = $1
ORDER BY c.created_at ASC`

const CREATE_COMMENT = `
insert into
comments (comment_body, user_id, movie_id)
values ($1, $2, $3) RETURNING *
`

const ReadComments = ({ movieId }) => fetchAll(READ_COMMENTS, movieId)
const CreateComment = ({ commentBody, userId, movieId }) => fetch(CREATE_COMMENT, commentBody, userId, movieId)

module.exports = {
	ReadComments,
	CreateComment,
}