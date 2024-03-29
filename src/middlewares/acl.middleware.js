'use strict';
require('dotenv').config();
const DEVMODE = process.env.DEVMODE;

module.exports = (role) => (req, res, next) => {
    try {

        // We already add the user property in the bearer middlewares
        if (req.user.role === role) {
            return next();
        }
        next('Access Denied');

    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');

    }
};