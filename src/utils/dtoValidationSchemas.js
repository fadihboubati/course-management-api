'use strict';

const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
});

const reviewSchema = Joi.object({
    text: Joi.string().required(),
    rating: Joi.number().required(),
});

module.exports = {
    userSchema,
    reviewSchema,
};
