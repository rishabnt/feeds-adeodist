const path = require('path');
require('dotenv').config();
const { Pool, Client } = require('pg');
const bcrypt = require('bcryptjs');

// Create Pool using DB details stored as environment variables
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST, 
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

// DB Connect function
const connectToDB = async () => {
    try {
        await pool.connect();
        console.log("Connected to DB")
        const res = await pool.query("SELECT * FROM FUSER WHERE ROLE='super-admin'");
        if(res.rows.length < 1) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('abc@123', salt);
            const res = await pool.query(`INSERT INTO FUSER VALUES ('Super Admin','super-admin','super@admin','${hashedPassword}')`)
            if(res.rowCount == 1) {
                console.log("Created super-admin. email - super@admin, password - abc@123");
            }
        }
        // await pool.end();
    } catch (error) {
        console.error(error);
    }
}

// User functions
const findAllUsers = async () => {
    try {
        const res = await pool.query('SELECT * FROM FUSER');
        return res.rows;
    } catch (error) {
        console.log(error);
    }
}
const findUsersByColumn = async (key: string, value: string) => {
    try {
        const res = await pool.query(`SELECT * FROM FUSER WHERE ${key}='${value}'`);
        return res.rows;
    } catch (error) {
        console.log(error);
    }
}
const createUser = async (name: string, role: string, email: string, password: string) => {
    try {
        const res = await pool.query(`INSERT INTO FUSER VALUES ('${name}','${role}','${email}','${password}')`);
        return res.rowCount;
    } catch (error) {
        console.log(error);
    }
}
const updateUser = async (email: string, key: string, value: string) => {
    try {
        const res = await pool.query(`UPDATE FUSER SET ${key} = '${value}' WHERE EMAIL='${email}'`);
        return 'Updated row count - ' + res.rowCount;
    } catch (error) {
        console.log(error);
    }
}
const removeUser = async (email: string) => {
    try {
        const res = await pool.query(`DELETE FROM FUSER WHERE EMAIL = '${email}'`);
        return 'Deleted row count - ' + res.rowCount;
    } catch (error) {
        console.log(error);
    }
}

// Feed functions
const findAllFeeds = async () => {
    try {
        const res = await pool.query('SELECT * FROM FEED');
        return res.rows;
    } catch (error) {
        console.log(error);
    }
}
const findFeedsByColumn = async (key: string, value: string) => {
    try {
        const res = await pool.query(`SELECT * FROM FEED WHERE ${key.toUpperCase()}='${value}'`);
        return res.rows;
    } catch (error) {
        console.log(error);
    }
}
const createFeed = async (name: string, url: string, description: string, canAccess: string, canDelete: string) => {
    try {
        const res = await pool.query(`INSERT INTO FEED VALUES ('${name}','${url}','${description}', '${canAccess}', '${canDelete}')`);
        return res;
    } catch (error) {
        console.log(error);
    }
}
const updateFeed = async (id: string, key: string, value: string) => {
    try {
        const res = await pool.query(`UPDATE FEED SET ${key} = '${value}' WHERE ID='${id}'`);
        console.log(res);
        return res;
    } catch (error) {
        console.log(error);
    }
}
const removeFeed = async (id: string) => {
    try {
        const res = await pool.query(`DELETE FROM FEED WHERE ID = '${id}'`);
        return res;
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    connectToDB, 
    findUsersByColumn, 
    findAllUsers,
    createUser,
    updateUser,
    removeUser,
    findAllFeeds,
    findFeedsByColumn,
    createFeed,
    updateFeed,
    removeFeed
};