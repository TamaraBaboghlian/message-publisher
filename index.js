const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const error = require('./middleware/error');
const winston = require('winston');
const validate = require('./middleware/validation');
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

app.post('/publish', validate, (req, res) => {
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