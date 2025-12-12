import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DBhost,
  user: process.env.DBuser,
  password: process.env.DBpassword,
  database: process.env.MYSQLdatabase,
});
