'use strict';

require('dotenv').config();

const DEVMODE = process.env.DEVMODE;

async function getHelloWorldService(msg) {

    try {
        let str = msg;
        return str;
    } catch (error) {
        throw new Error(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }

}

module.exports = {
    getHelloWorldService,
};
