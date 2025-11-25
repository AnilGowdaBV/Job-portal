import mysql from "mysql2/promise";

const connectionOptions = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_POOL_LIMIT ?? 10),
      queueLimit: 0,
      ssl:
        process.env.MYSQL_SSL === "true"
          ? {
              rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false"
            }
          : undefined
    }
  : {
      host: process.env.MYSQL_HOST ?? "localhost",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE ?? "job_portal",
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_POOL_LIMIT ?? 10),
      queueLimit: 0
    };

const pool = mysql.createPool(connectionOptions);

export async function query({ sql, values }) {
  try {
    const [rows] = await pool.execute(sql, values);
    return rows;
  } catch (error) {
    console.error("Database query failed", error);
    throw error;
  }
}

export async function getConnection() {
  return pool.getConnection();
}

export default pool;
