var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Also a good syntax:
// var Schema = require('mongoose').Schema;

var user = new Schema({
  id:  { type: String, unique: true },
  name: String,
  email:   { type: String, unique: true },
  password: String,
  followingIds: { type: [String], default: [] }
});

module.exports = user;