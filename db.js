// import pg from "pg";

// let pool;

/**
 * Initializes the PostgreSQL connection pool.
 * @param {string} connectionString - The database URL
 */
export function initDb(connectionString) {
  console.log('Database initialization disabled');
  // pool = new pg.Pool({ connectionString });
}

/**
 * Executes a SQL query using the connection pool.
 * @param {string} sql - The SQL query
 * @param {Array<any>} params - Optional query parameters
 * @returns {Promise<Array<any>>} - Query result rows
 */
export async function query(sql, params = []) {
  console.log('Database query disabled');
  return [];
  // const client = await pool.connect();
  // try {
  //   const result = await client.query(sql, params);
  //   return result.rows;
  // } finally {
  //   client.release();
  // }
}
