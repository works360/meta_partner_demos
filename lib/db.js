import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "193.203.166.156",
  user: "u213188322_metapartner",
  password: "KeepDemo@321!!",
  database: "u213188322_metapartner",
});
