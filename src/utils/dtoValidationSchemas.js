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

const thing1Schema = Joi.object({
    thing1string: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    thing1number: Joi.number()
        .integer()
        .min(3)
        .max(30)
        .required(),
});

const thing2Schema = Joi.object({
    thing2string: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    thing2number: Joi.number()
        .integer()
        .min(3)
        .max(30)
        .required(),
});

const thing3Schema = Joi.object({
    thing3string: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    thing3number: Joi.number()
        .integer()
        .min(3)
        .max(30)
        .required(),
});

module.exports = {
    userSchema,
    thing1Schema,
    thing2Schema,
    thing3Schema,
};
