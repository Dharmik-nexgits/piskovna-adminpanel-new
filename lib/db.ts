import sql from "mssql";

const server = process.env.DB_SERVER || "DESKTOP-7TQD1BU\\SQLEXPRESS";
const sanitizedServer = server.replace(/^tcp:/, "").split(",")[0];

const sqlConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: sanitizedServer,
  options: {
    encrypt: sanitizedServer.includes("database.windows.net"),
    trustServerCertificate: true,
  },
};

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
