var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Also a good syntax:
// var Schema = require('mongoose').Schema;

var tweet = new Schema({
//  id:  { type: String, unique: true },
  userId: String,
  created:   Number,
  text: String
});

module.exports = tweet;