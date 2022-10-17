const { fetch, fetchAll } = require('../../../lib/postgres')

const SEARCH = `
SELECT * FROM movies WHERE lower(movie_name) LIKE lower($1) OR lower(movie_name_ru) LIKE lower($1);
`


const search = (value) => fetchAll(SEARCH, value)

module.exports = {
    search
}
