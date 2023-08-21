# feeds-adeodist
An API for secure CRUD operations on Feeds and users built with Node.js, Typescript, Express and Postgresql. 

Steps to setup on your system - 
1. Make sure Postgresql is installed in your computer. Run the script below to create the Database, Tables and insert initial values into the tables -
   In shell -
   $ sudo -u -i postgres #Sign into shell as postgres user
   $ createdb Feeds #Create database Feeds
   $ psql -d Feeds #Open Postgres command line with Feeds as database

   In Postgres shell
   # CREATE TABLE FUSER (ID SERIAL PRIMARY KEY, NAME VARCHAR (40) NOT NULL, ROLE VARCHAR (15) NOT NULL, EMAIL varchar (40) NOT NULL, PASSWORD VARCHAR (70) NOT NULL);
   # CREATE TABLE FEED (ID SERIAL PRIMARY KEY, NAME VARCHAR (40) NOT NULL, URL VARCHAR (20) NOT NULL, DESCRIPTION VARCHAR (40) NOT NULL, CAN_ACCESS VARCHAR (20) NOT NULL, CAN_DELETE VARCHAR (20) NOT NULL);

   /* Create users with the API using the super admin user created at server startup */
   # INSERT INTO FEED VALUES('SA FEED', '12121', 'THIS IS A TEST DESCRIPTION', 'super-admin', 'super-admin');
   # INSERT INTO FEED VALUES('ADMIN FEED', '342345', 'THIS IS A TEST DESCRIPTION', 'admin', 'admin');
   # INSERT INTO FEED VALUES('BASIC FEED', '667875', 'THIS IS A TEST DESCRIPTION', 'basic', 'admin');
   /*Make sure DB is running in the backend before moving forward*/

2. Download the code repo and install dependency -
   $ npm install
3. Create a .env file in the root folder of project with the following details, as setup in your DB -
   PGUSER=postgres
   PGHOST=localhost
   PGDATABASE=feeds
   PGPASSWORD=postgres
   PGPORT=5432
   PORT=5000
   JWT_SECRET=<your_jwt_secret>
4. Start the application using -
   $ npm run dev
   
