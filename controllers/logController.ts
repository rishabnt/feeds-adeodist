const asyncHandler = require('express-async-handler');
const { logger } = require('../logger');
const fs = require('fs')

import { Request, Response } from 'express';

const getLogs = asyncHandler(async (req: Request, res: Response) => {

    if(req.user.role !== 'super-admin') {
        res.status(400);
        logger.error("/api/logs/get-logs - Permission denied");
        throw new Error("Permission denied");
    }
    
    let dirToCheck = './logs'

    let files = fs.readdirSync(dirToCheck)

    let latestPath = `${dirToCheck}/${files[0]}`
    let latestTimeStamp = fs.statSync(latestPath).mtime.getTime()

    files.forEach(file => {

        let path = `${dirToCheck}/${file}`

        let timeStamp = fs.statSync(path).mtime.getTime()

        if (timeStamp > latestTimeStamp) {
            latestTimeStamp = timeStamp
            latestPath = path
        }
    });

    fs.readFile(latestPath, "utf8", (err, file) => {
        if(file) {
            res.status(200).send(file);
            logger.info("Logs requested -" + latestPath);
        } else {
            res.status(400).send("There are currently no log files to be read");
            logger.error("Logs requested - There are currently no log files to be read")
        }
    })

})

module.exports = {
    getLogs
};