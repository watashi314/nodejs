var config = require('../config');
var mongoose = require('mongoose');
var connection = mongoose.createConnection(config.get('database:host'), config.get('database:name'), config.get('database:port'));

var userSchema = require('./schemas/user.js');
connection.model('User', userSchema);
var tweetSchema = require('./schemas/tweet.js');
connection.model('Tweet', tweetSchema);

module.exports = connection;
//test