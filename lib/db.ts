import sql from "mssql";

const sqlConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER || "DESKTOP-7TQD1BU\\SQLEXPRESS",
  // pool: {
  //   max: 10,
  //   min: 0,
  //   idleTimeoutMillis: 30000,
  // },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Singleton connection pool
let pool: sql.ConnectionPool | null = null;

export const getPool = async () => {
  if (pool) return pool;

  try {
    pool = await sql.connect(sqlConfig);
    console.log("Connected to MSSQL");
    return pool;
  } catch (err) {
    console.error("Database connection failed: ", err);
    throw err;
  }
};

export { sql };
