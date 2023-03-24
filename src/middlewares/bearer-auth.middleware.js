'use strict';
const prisma = require('../models/index');

require('dotenv').config();
const DEVMODE = process.env.DEVMODE;

module.exports = async function (req, res, next) {
    try {

        if (!req.headers.authorization) {
            next('No Authorization info, username and password are required');
            return;
        }

        next();
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
        return;
    }
};