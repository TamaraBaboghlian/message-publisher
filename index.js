const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const error = require('./middleware/error');
const winston = require('winston');
const Joi = require('joi');
require('express-async-errors');

// handling and logging exceptions thrown from outside request processing pipeline
winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: 'uncaughtExceptions.log' }));

process.on('unhandledRejection', (ex) => {
    throw ex;
});

// logg exceptions
winston.add(winston.transports.File, { filename: 'logfile.log' });

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

//routes
app.get('/', (req, res) => {
    res.render('index');
})

app.post('/publish', (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    io.emit('pub message', req.body.message);
    res.sendStatus(200);
})

// add err handling middleware at the end of request processing pipeline
app.use(error)

io.on('connection', (socket) => {
    console.log('client connected');
    socket.on('pub message', function (data) {
        io.emit('pub message', data.message);
    });
    socket.on('disconnect', function () {
        console.log('client disconnected');
    });
});

const port = process.env.PORT || 3000;

http.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});

function validate(req) {
    const schema = {
        message: Joi.string().min(3).required()
    };

    return Joi.validate(req, schema);
}