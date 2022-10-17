const { fetch, fetchAll, fetchDelete } = require('../../../lib/postgres')

const READ_CATEGORY = `
SELECT
*
FROM categories c
WHERE c.category_name != 'LIVE'
`

const READ_CATEGORY_ONE = `
	SELECT *
	FROM categories c
	WHERE lower(c.category_name) LIKE lower($1) OR lower(c.category_name_ru) LIKE lower($1)`


const READ_CATEGORY_SINGLE = `
	SELECT *
	FROM categories c
	WHERE c.category_id = $1`

const READ_CATEGORY_MOVIES = `
SELECT
*
FROM movies m
NATURAL JOIN movie_category m_cat
LEFT JOIN categories c ON c.category_id = m_cat.category_id
WHERE lower(c.category_name) LIKE lower($1) OR lower(c.category_name_ru) LIKE lower($1)
ORDER BY movie_name
OFFSET 0 ROWS FETCH FIRST 30 ROWS ONLY
`

const READ_CATEGORY_MOVIES_OFFSET = `
SELECT
*
FROM movies m
NATURAL JOIN movie_category m_cat
LEFT JOIN categories c ON c.category_id = m_cat.category_id
WHERE lower(c.category_name) LIKE lower($1) OR lower(c.category_name_ru) LIKE lower($1)
ORDER BY movie_name
`

const READ_CATEGORY_MOVIES_OFFSET_COUNT = `
SELECT
	COUNT(movie_id)
FROM movies m
NATURAL JOIN movie_category m_cat
LEFT JOIN categories c ON c.category_id = m_cat.category_id
WHERE lower(c.category_name) LIKE lower($1) OR lower(c.category_name_ru) LIKE lower($1)
`

const CREATE_CATEGORY = `
INSERT INTO
categories (category_name, category_name_ru)
VALUES ($1, $2) RETURNING *
`

const UPDATE_CATEGORY = `
UPDATE categories
SET category_name = $2,
category_name_ru = $3
WHERE category_id = $1
RETURNING *
`
const del = (id) => {
	return `
	DELETE FROM categories
	WHERE category_id = '${id}'
	RETURNING *
	`
}
const delKeys = (id) => {
	return `
	DELETE FROM movie_category
	WHERE category_id = '${id}'
	RETURNING *
	`
}
const delTrillerKeys = (id) => {
	return `
	DELETE FROM triller_category
	WHERE category_id = '${id}'
	RETURNING *
	`
}
const checkTrillerKeys = (id) => {
	return `
	SELECT FROM triller_category
	WHERE category_id = '${id}'
	`
}




const ReadCategory = () => fetchAll(READ_CATEGORY)
const ReadCategoryOne = ({ categoryName }) => fetch(READ_CATEGORY_ONE, categoryName)
const ReadCategorySingle = ({ id }) => fetch(READ_CATEGORY_SINGLE, id)
const ReadCategoryMovies = ({ categoryName }) => fetchAll(READ_CATEGORY_MOVIES, `%${categoryName}%`)
const ReadCategoryMoviesOffSet = ({ categoryName}) => fetchAll(READ_CATEGORY_MOVIES_OFFSET, `%${categoryName}%`)
const ReadCategoryMoviesOffSetCount = ({ categoryName }) => fetch(READ_CATEGORY_MOVIES_OFFSET_COUNT, `%${categoryName}%`)
const CreateCategory = ({ category_name, category_name_ru }) => fetch(CREATE_CATEGORY, category_name, category_name_ru)
const UpdateCategory = ({ id, categoryName, categoryNameRu }) => fetch(UPDATE_CATEGORY, id, categoryName, categoryNameRu)
const DeleteCategory = ({ id }) => fetchDelete(delKeys(id), del(id), checkTrillerKeys(id), delTrillerKeys(id))



module.exports = {
	CreateCategory,
	ReadCategory,
	ReadCategorySingle,
	ReadCategoryMovies,
	ReadCategoryMoviesOffSet,
	ReadCategoryMoviesOffSetCount,
	ReadCategoryOne,
	UpdateCategory,
	DeleteCategory
}
