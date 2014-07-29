'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/lendup_final');
mongoose.connect('mongodb://heroku_app27829266:lihouivtsc3h8h1rugu99u7mjk@ds053429.mongolab.com:53429/heroku_app27829266');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("mongoose connection is open")
});

var Schema = mongoose.Schema

/**
 * Call Schema
 */
var CallSchema = new Schema({
    callTime: {
        type: Date,
        default: Date.now
    },
    delay: Number,
    from: String,
    to: String,
    countTo: Number
});

var Call = mongoose.model('Call', CallSchema);

module.exports = {"Call": Call};