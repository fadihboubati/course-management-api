'use strict';

require('dotenv').config();
const DEVMODE = process.env.DEVMODE;
const prisma = require('../models/index');
const { getHelloWorldService } = require('../services/xxxxxx.service');

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

async function getHome(req, res, next) {
    try {
        const msg = 'Hello world';
        const greetingMessage = await getHelloWorldService(msg);
        res.status(200).send(greetingMessage);
        // console.log("get Passed");
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
}


module.exports = {
    getHome,
};