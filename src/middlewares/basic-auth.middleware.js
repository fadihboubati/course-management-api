'use strict';
require('dotenv').config();
const DEVMODE = process.env.DEVMODE;

const base64 = require('base-64');
const bcrypt = require('bcrypt');
const { userModel } = require('../models');


module.exports = async (req, res, next) => {

    try {
        if (!req.headers.authorization) {
            res.status(400).send('No Auth Info, username and password are required');
            return;
        }

        const basicHeaderParts = req.headers.authorization.split(' ');
        const encodedData = basicHeaderParts[1];
        const decodedData = base64.decode(encodedData);
        const [username, password] = decodedData.split(':');
        const user = await userModel.findOne({ username });
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            req.user = {
                user: {
                    _id: user._id,
                    username: user.username,
                    capabilities: user.capabilities,
                },
                token: user.token,
            };
            next();
        } else {
            throw new Error('Invalid User');
        }

    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
};