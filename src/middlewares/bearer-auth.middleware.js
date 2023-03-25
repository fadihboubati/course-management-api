'use strict';
const prisma = require('../models/index');
// const prisma = new PrismaClient();

require('dotenv').config();
const DEVMODE = process.env.DEVMODE;

module.exports = async function (req, res, next) {
    try {

        if (!req.headers.authorization) {
            next('No Authorization info, username and password are required');
            return;
        }

        // its not a real token, its the username, but I will assume its a token for authorization purpose
        const basicHeaderParts = req.headers.authorization.split(' ');
        const token = basicHeaderParts[1];

        // parsed and verify the token
        // const parsedToken = jwt.verify(token, process.env.PRIVATEKEY); // raise an error if not verify
        // ...
        const parsedToken = token;


        let username = parsedToken
        const user = await prisma.user.findUnique({
            where: { username: username },
        });
        if (user) {
            req.user = user
            return next();

        }
        next('Invalid Token or User Not Found');

    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
        return;
    }
};