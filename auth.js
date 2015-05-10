var fixtures = require('./fixtures');
var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


function verify(username, password, done) {
	var userFound = _.find(fixtures.users, 'id', username);
	if (!userFound) {
		return done(null,false, { message: 'Incorrect username.'});
	} else {
		if (userFound.password==password) {
			return done(null, userFound);
		} else {
			return done(null, false, { message: 'Incorrect password.' });
		}
    }
  };
  
passport.use(new LocalStrategy(verify));
      
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	var userFound = _.find(fixtures.users, 'id', id);
	if (!userFound) {
		done (null, false);
	} else {
		done (null, userFound);
	}
});

module.exports = passport;

