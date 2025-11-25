import mysql from "mysql2/promise";

const defaultLimit = Number(process.env.MYSQL_POOL_LIMIT ?? 10);

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    const config = {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: defaultLimit,
      queueLimit: 0
    };

    if (process.env.MYSQL_SSL === "true") {
      config.ssl = {
        rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false"
      };
    }

    return { poolConfig: config, database: url.pathname.replace(/^\//, "") };
  }

  const dbName = process.env.MYSQL_DATABASE ?? "job_portal";
  return {
    poolConfig: {
      host: process.env.MYSQL_HOST ?? "localhost",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: dbName,
      waitForConnections: true,
      connectionLimit: defaultLimit,
      queueLimit: 0
    },
    database: dbName
  };
}

const { poolConfig, database } = buildPoolConfig();
const pool = mysql.createPool(poolConfig);

const columns = [
  { name: "logo_url", definition: "VARCHAR(255) NULL" },
  { name: "banner_url", definition: "VARCHAR(255) NULL" },
  { name: "website", definition: "VARCHAR(255) NULL" },
  { name: "linkedin_url", definition: "VARCHAR(255) NULL" },
  { name: "twitter_url", definition: "VARCHAR(255) NULL" },
  { name: "github_url", definition: "VARCHAR(255) NULL" },
  { name: "employees_count", definition: "INT UNSIGNED NULL" },
  { name: "founded_year", definition: "INT NULL" },
  { name: "industry", definition: "VARCHAR(120) NULL" },
  { name: "mission", definition: "TEXT NULL" },
  { name: "description", definition: "TEXT NULL" },
  { name: "location", definition: "VARCHAR(160) NULL" },
  { name: "hiring_focus", definition: "VARCHAR(160) NULL" }
];

async function ensureColumns() {
  if (!database) {
    throw new Error("Unable to determine database name. Set MYSQL_DATABASE or DATABASE_URL.");
  }

  const connection = await pool.getConnection();
  try {
    for (const column of columns) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'companies' AND COLUMN_NAME = ?`,
        [database, column.name]
      );
      const exists = rows?.[0]?.count > 0;
      if (exists) {
        console.log(`✔ Column ${column.name} already exists.`);
        continue;
      }

      console.log(`➕ Adding column ${column.name} ...`);
      await connection.query(`ALTER TABLE companies ADD COLUMN ${column.name} ${column.definition}`);
      console.log(`   Added column ${column.name}.`);
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

ensureColumns()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  });
