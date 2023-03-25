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

        // its not a real token, its the user id, but I will assume its a token for authorization purpose
        const basicHeaderParts = req.headers.authorization.split(' ');
        const token = basicHeaderParts[1];
        const user = await prisma.user.findUnique({
            where: { username: token },
        });

        if (user) {
            req.user = userInfo
            next();
        }
        next('Invalid Token');

    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
        return;
    }
};