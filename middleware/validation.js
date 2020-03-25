const Joi = require('joi');

module.exports = (req, res, next) => {
    const schema = {
        message: Joi.string().min(3).required()
    };

    const { error } = Joi.validate(req.body, schema);
    if (error) return res.status(400).send(error.details[0].message);
    next();
}