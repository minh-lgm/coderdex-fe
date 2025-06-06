require("dotenv").config()
const cors= require("cors");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var pokemonRouter = require('./routes/pokemon');

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); //


app.use('/pokemons', pokemonRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter);

module.exports = app;
