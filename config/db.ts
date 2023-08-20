const path = require('path');
require('dotenv').config();
const { Pool, Client } = require('pg');

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
        const res = await pool.query('SELECT * FROM FUSER');
        console.log(res);
        await pool.end();
    } catch (error) {
        console.error(error);
    }
}

// User functions
const getUsers = async () => {
    try {
        return await pool.query('SELECT * FROM FUSER').rows;
    } catch (error) {
        console.log(error);
    }
}
const getUserById = async (id: string) => {
    try {
        return await pool.query(`SELECT * FROM FUSER WHERE ID='${id}'`).rows;
    } catch (error) {
        console.log(error);
    }
}
const createUser = async (id: string, name: string, role: string, email: string, password: string) => {
    try {
        return await pool.query(`INSERT INTO FUSER VALUES ('${id}','${name}','${role}','${email}','${password}')`);
    } catch (error) {
        console.log(error);
    }
}
const updateUser = async (id: string, row: string, value: string) => {
    try {
        return await pool.query(`UPDATE FUSER SET ${row} = ${value} WHERE ID=${id}`);
    } catch (error) {
        console.log(error);
    }
}
const deleteUser = async (id: string) => {
    try {
        return await pool.query(`DELETE FROM users WHERE id = ${id}`);
    } catch (error) {
        console.log(error);
    }
}

// Feed functions
const getAllFeeds = async () => {
    try {
        return await pool.query('SELECT * FROM FEED').rows;
    } catch (error) {
        console.log(error);
    }
}
const getFeedById = async (id: string) => {
    try {
        return await pool.query(`SELECT * FROM FEED WHERE ID='${id}'`).rows;
    } catch (error) {
        console.log(error);
    }
}
const createFeed = async (id: string, name: string, url: string, description: string) => {
    try {
        return await pool.query(`INSERT INTO FEED VALUES ('${id}','${name}','${url}','${description}')`);
    } catch (error) {
        console.log(error);
    }
}
const updateFeed = async (id: string, row: string, value: string) => {
    try {
        return await pool.query(`UPDATE FEED SET ${row} = ${value} WHERE ID=${id}`);
    } catch (error) {
        console.log(error);
    }
}
const deleteFeed = async (id: string) => {
    try {
        return await pool.query(`DELETE FROM FEED WHERE ID = ${id}`);
    } catch (error) {
        console.log(error);
    }
}



module.exports = connectToDB