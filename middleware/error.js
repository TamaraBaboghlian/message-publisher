const winston = require('winston');

module.exports = (err, req, res, next) => {
    // log err
    winston.log('error', err.message);
    res.status(500).send('Something failed.');
}