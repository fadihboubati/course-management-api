'use strict';
require('dotenv').config();
const DEVMODE = process.env.DEVMODE;
const bearerAuth = require('../middlewares/bearer-auth.middleware');
const acl = require('../middlewares/acl.middleware');

const express = require('express');
const router = express.Router();

router.get('/', bearerAuth, acl('read'), async (req, res, next) => {
    try {
        console.log('get Passed');
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
});

router.get('/:id', bearerAuth, acl('read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('get Passed');
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
});

router.post('/', bearerAuth, acl('create'), async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('post Passed');
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
});

router.put('/:id', bearerAuth, acl('update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('put Passed');
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
});

router.delete('/:id', bearerAuth, acl('delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('delete Passed');
    } catch (error) {
        next(DEVMODE ? error.message : 'Ops, Something wrong during singing up process');
    }
});

module.exports = router;