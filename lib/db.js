import mysql from "mysql2/promise";

console.log("USING DB HOST:", process.env.DB_HOST);

export const db = mysql.createPool({
  host: process.env.DB_HOST || "193.203.166.156",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
