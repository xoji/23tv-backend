const GET_SEASONS = () => {
    return `SELECT * FROM seasons WHERE movie_id=$1 ORDER BY season_num`
}
const GET_SERIAS = () => {
    return `select * from movie_serials where season_id=$1 order by substring(movie_name, '\\d+')::int NULLS FIRST`
}
const ADD_SEASON = () => {
    return `INSERT INTO seasons(season_num, movie_id) VALUES ($1, $2) RETURNING *`
}
module.exports = {
    GET_SEASONS,
    GET_SERIAS,
    ADD_SEASON
}
