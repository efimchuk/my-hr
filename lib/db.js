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
    await upgrade_5();
    await upgrade_6();
    await upgrade_7();
    await upgrade_8();
    await upgrade_9();
    await upgrade_10();
    await upgrade_11();
    await upgrade_12();
    await upgrade_13();
    await upgrade_14();
    await upgrade_15();
}

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

async function upgrade_4(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 4){
        await Query(`ALTER TABLE users
                        ALTER COLUMN id SET DATA TYPE INTEGER;
                    CREATE TABLE IF NOT EXISTS tests(
                        uuid UUID DEFAULT uuid_generate_v4(),
                        id SERIAL UNIQUE,
                        name VARCHAR(256),
                        author_id SERIAL REFERENCES users (id) ON DELETE CASCADE)`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_5(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 5){
        await Query(`
                    CREATE TABLE IF NOT EXISTS exercises(
                        id SERIAL PRIMARY KEY,
                        text TEXT NOT NULL,
                        type SMALLINT NOT NULL,
                        test_id SERIAL REFERENCES tests (id) ON DELETE CASCADE);
                    CREATE TABLE IF NOT EXISTS variants(
                        id SERIAL PRIMARY KEY,
                        exercise_id SERIAL REFERENCES exercises (id) ON DELETE CASCADE,
                        correct BOOLEAN NOT NULL,
                        text VARCHAR(256) NOT NULL)`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_6(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 6){
        await Query(`
                    CREATE TABLE IF NOT EXISTS invitations(
                        id SERIAL PRIMARY KEY,
                        uuid UUID DEFAULT uuid_generate_v4(),
                        test_id SERIAL REFERENCES tests (id) ON DELETE CASCADE,
                        pin VARCHAR(6))`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_7(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 7){
        await Query(`ALTER TABLE users
                        ADD COLUMN role SMALLSERIAL;
                    ALTER TABLE users
                        ALTER COLUMN role SET DEFAULT 1;
                    UPDATE users
                    SET role = 1;
                    ALTER TABLE users
                        ALTER COLUMN role SET NOT NULL;
                    AlTER TABLE invitations
                        DROP COLUMN IF EXISTS pin`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_8(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 8){
        await Query(`ALTER TABLE invitations
                        ADD COLUMN status SMALLSERIAL;
                    ALTER TABLE invitations
                        ALTER COLUMN status SET DEFAULT 1;
                    UPDATE invitations
                    SET status = 1;
                    ALTER TABLE invitations
                        ALTER COLUMN status SET NOT NULL;
                    CREATE TABLE answers(
                        invitation_id SERIAL REFERENCES invitations (id) ON DELETE CASCADE,
                        variant_id SERIAL REFERENCES variants (id),
                        exercise_id SERIAL REFERENCES exercises (id) ON DELETE CASCADE,
                        text text NULL
                    )`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_9(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 9){
        await Query(`ALTER TABLE answers
                        ADD COLUMN pass BOOLEAN;
                    ALTER TABLE answers
                        ALTER COLUMN pass SET DEFAULT FALSE;
                    UPDATE answers
                    SET pass = FALSE;
                    ALTER TABLE answers
                        ALTER COLUMN pass SET NOT NULL`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_10(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 10){
        await Query(`ALTER TABLE answers
                        DROP COLUMN variant_id;
                    ALTER TABLE answers
                        ADD COLUMN variant_id SERIAL;
                    ALTER TABLE answers
                        ALTER COLUMN variant_id DROP NOT NULL;
                    ALTER TABLE answers
                        ALTER COLUMN variant_id SET DEFAULT NULL`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_11(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 11){
        await Query(`CREATE TABLE vacancies(
                        id SERIAL PRIMARY KEY,
                        uuid UUID DEFAULT uuid_generate_v4(),
                        name VARCHAR(256),
                        description TEXT,
                        author_id SERIAL NOT NULL,
                        experience_time SMALLSERIAL,
                        test_id SERIAL NOT NULL
                    );
                    CREATE TABLE candidats(
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(256),
                        phone VARCHAR(20),
                        description TEXT,
                        invitation_id SERIAL,
                        vacancy_id SERIAL REFERENCES vacancies (id) ON DELETE CASCADE
                    );
                    ALTER TABLE candidats
                        ALTER COLUMN invitation_id DROP NOT NULL`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_12(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 12){
        await Query(`ALTER TABLE vacancies
                        ALTER COLUMN test_id DROP NOT NULL;
                    ALTER TABLE vacancies
                        ALTER COLUMN test_id SET DEFAULT NULL`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_13(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 13){
        await Query(`ALTER TABLE candidats
                        ALTER COLUMN invitation_id DROP NOT NULL;
                    ALTER TABLE candidats
                        ALTER COLUMN invitation_id SET DEFAULT NULL`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_14(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 14){
        await Query(`ALTER TABLE vacancies
                        ADD COLUMN creation_time TIMESTAMP WITHOUT TIME ZONE,
                        ALTER COLUMN creation_time SET DEFAULT NOW();
                    ALTER TABLE candidats
                        ADD COLUMN creation_time TIMESTAMP WITHOUT TIME ZONE,
                        ALTER COLUMN creation_time SET DEFAULT NOW();
                    ALTER TABLE invitations
                        ADD COLUMN creation_time TIMESTAMP WITHOUT TIME ZONE,
                        ADD COLUMN executed_time TIMESTAMP WITHOUT TIME ZONE,
                        ALTER COLUMN creation_time SET DEFAULT NOW();
                    ALTER TABLE answers
                        ADD COLUMN executed_time TIMESTAMP WITHOUT TIME ZONE,
                        ALTER COLUMN executed_time SET DEFAULT NOW();`);
        // set version number
        await incrementDBVersion();
    }
}

async function upgrade_15(){
    let dbVersion = await getDBVersion();

    if(dbVersion < 15){
        await Query(`ALTER TABLE tests
                        ADD COLUMN creation_time TIMESTAMP WITHOUT TIME ZONE,
                        ALTER COLUMN creation_time SET DEFAULT NOW();`);
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