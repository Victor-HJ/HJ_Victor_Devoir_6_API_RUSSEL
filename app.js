var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const path = require('path');

var indexRouter = require('./routes/index');
const mongodb = require('./db/mongo');

mongodb.initClientDbConnection();

const app = express();

app.set('view engine', 'ejs');

app.use(cors({ 
    exposedHeaders : ['Authorization'],
    origin : '*' 
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req,res) => {
    res.render('index');
});

app.use('/docs', express.static(path.join(__dirname, 'out')));

app.use('/', indexRouter);

app.use(function(req, res, next) {
    res.status(404).json({name : 'API_Russel', version : '1.0', status : 404, message : 'api_not_found'})
});

module.exports = app;
