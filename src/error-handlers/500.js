'use strict';

module.exports = (error, req, res, next) => {

    return res.status(req.statusCode || 500).json({
        code: req.statusCode || 500,
        route: req.path,
        message: `Server Error: ${error.message || error}`,
    });
};