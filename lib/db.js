'use strict'

require('dotenv').config();

const { Client } = require('pg');
const client = new Client();


global.Query = async (text, values) => {
    return client.query(text, values);
}

async function getDBVersion(){
    let versionsTableExists = (await Query(`SELECT COUNT(*) > 0 AS exists FROM pg_tables WHERE tablename = 't_versions'`)).rows[0].exists;

    if(!versionsTableExists){
        return 0;
    } else {
        let dbVersion = (await Query(`SELECT MAX(version) AS current_version FROM t_versions`)).rows[0].current_version;
        return dbVersion;
    }
}

async function Upgrade(){
    await upgrade_1();
    await upgrade_2();
    await upgrade_3();
    await upgrade_4();

}

// Create table of verions
async function upgrade_1(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 1){
        await Query(`CREATE TABLE t_versions (version SERIAL NOT NULL UNIQUE);
                        INSERT INTO t_versions (version) VALUES (1)`);
    }
}

async function incrementDBVersion(){
    await Query(`INSERT INTO t_versions (version) VALUES (
                    (SELECT MAX(version) + 1 FROM t_versions))`);
}

// Create main structure
async function upgrade_2(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 2){
        await Query(`CREATE TABLE IF NOT EXISTS users(
                        name VARCHAR(64) NOT NULL UNIQUE,
                        password VARCHAR(64) NOT NULL,
                        id SMALLSERIAL UNIQUE)`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_3(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 3){
        await Query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
                    ALTER TABLE users
                        ADD COLUMN IF NOT EXISTS uuid uuid DEFAULT uuid_generate_v4();`);
        // set version number
        await incrementDBVersion();
    }
}

// Create main structure
async function upgrade_4(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 4){
        await Query(`ALTER TABLE users
                        ALTER COLUMN id SET DATA TYPE INTEGER;
                    CREATE TABLE IF NOT EXISTS tests(
                        uuid uuid DEFAULT uuid_generate_v4(),
                        id SERIAL UNIQUE,
                        name VARCHAR(256),
                        author_id SERIAL REFERENCES users (id) ON DELETE CASCADE)`);
        // set version number
        await incrementDBVersion();
    }
}

module.exports = {
    Init : async function(){
        await client.connect();
        await Upgrade();
    }
};