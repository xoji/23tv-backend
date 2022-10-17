const { Pool } = require("pg");

const { PG } = require("../config");

const pool = new Pool(PG);

module.exports.fetch = async (SQL, ...params) => {
  const client = await pool.connect();
  try {
    const {
      rows: [row],
    } = await client.query(SQL, params.length ? params : null);
    return row;
  } catch (e) {
    console.log(e);
  } finally {
    await client.release();
  }
};

module.exports.fetchAll = async (SQL, ...params) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(SQL, params.length ? params : null);
    return rows;
  } catch (e) {
    console.log(e);
  } finally {
    await client.release();
  }
};
module.exports.fetchDelete = async (
  DELETE_KEYS,
  DELETE_CATEGORY,
  CHECK_TRILLER,
  DELETE_TRILLER
) => {
  const client = await pool.connect();
  try {
    const deleted_cat = await client.query(DELETE_KEYS);
    const deleted_key = deleted_cat.rows;
    const triller = await client.query(CHECK_TRILLER);
    if (triller) {
      await client.query(DELETE_TRILLER);
    }
    const { rows } = await client.query(DELETE_CATEGORY);
    return { rows, deleted_key };
  } catch (e) {
    console.log(e);
  } finally {
    await client.release();
  }
};
