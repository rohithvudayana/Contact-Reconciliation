import knex from "knex";
import configs from "./knexfile";

const deploy = configs[process.env.NODE_ENV || "development"];
const db = knex(deploy);
export default db;