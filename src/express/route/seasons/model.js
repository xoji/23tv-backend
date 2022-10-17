const {Pool} = require('pg')
const {PG} = require('../../../config')
const {GET_SEASONS, GET_SERIAS, ADD_SEASON} = require('./commands');


const pool = new Pool(PG)
class SeasonModel{
    async SeasonFetch(params){
        const client = await pool.connect()
        try {
            const {rows} = await client.query(GET_SEASONS(), [params])
            return rows
        } catch (e) {
            return e
        } finally {
            client.release()
        }
    }
    async SerialFetch(params){
        const client = await pool.connect()
        try {
            const {rows} = await client.query(GET_SERIAS(), [params])
            return rows
        } catch (e) {
            return e
        } finally {
            client.release()
        }
    }
    async CreateSeason(params){
        const client = await pool.connect()
        try{
            const {rows} = await client.query(ADD_SEASON(), params)
            return rows
        }catch (e) {
            return e
        }
    }
}
module.exports = new SeasonModel()
