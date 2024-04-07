import type {Knex}  from "knex";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DB_URL) {
    throw new Error("The URL not found in dotenv file");
}

interface KnexConfig {
    [key: string] : Knex.Config;
}

const configs: KnexConfig = {
    development: {
        client : "pg",
        connection: process.env.DB_URL,
        pool: {
            min: 3,
            max: 30,
            acquireTimeoutMillis: 300000,
            createTimeoutMillis: 300000,
            destroyTimeoutMillis: 50000,
            idleTimeoutMillis: 300000,
            reapIntervalMillis: 10000,
            createRetryIntervalMillis: 2000,
            propagateCreateError: false,
        },
        acquireConnectionTimeout: 60000,
    searchPath: ["knex", "public"],
    migrations: {
      directory: "./migrations",
    },
    seeds: { directory: "./seeds" },
    },

    testing: {
        client: "pg",
        connection: process.env.DB_URL,
        searchPath: ["knex", "public"],
        migrations: {
          directory: "./migrations",
        },
        seeds: { directory: "./seeds" },
    },

    production: {
        client: "pg",
        connection: process.env.DB_URL,
        searchPath: ["knex", "public"],
        migrations: {
          directory: "./migrations",
        },
        seeds: { directory: "./seeds" },
    },
}

export default configs;