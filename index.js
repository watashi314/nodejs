var express = require('express');
var fixtures = require('./fixtures');
var app=express();
var bodyParser = require('body-parser');
var _ = require('lodash');

var session = require('express-session')
var cookieParser = require('cookie-parser');
var passport = require('./auth');
var LocalStrategy = require('passport-local').Strategy;

var config = require('./config');
var app = express();

var conn = require('./db');
var userModel = conn.model('User')

app.use(cookieParser());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());

function ensureAuthentication(req, res, next) {
	console.log ('Entering ensureAuthentication');
	if (!req.isAuthenticated()) {
		console.log ('...Result: not authenticated');
		return res.sendStatus (403);
	}
	console.log ('...Result: authenticated');
	next();
}

app.post('/api/auth/login', function (req, res, next) {
			passport.authenticate('local', 
					function(err, user, info) {
						if (err) { return res.sendStatus(500); }
						if (!user) { return res.sendStatus(403); }
						req.login(user, function(err) {
							if (err) { return sendStatus(500); }
							return res.send({user: user});
						});
					}
			)(req, res, next)
});

app.post('/api/users', function (req, res) {
	console.log ('Entering POST /api/users');
	//if (_.find(fixtures.users,  'id', req.body.user.id)) {
	//	return res.sendStatus(409);
	//}
	var user = req.body.user;
	user["followingIds"]=[];
	//console.log (user);
	// var userModel = conn.model('User')   - moded to top
	var myRecord = new userModel(user);
	myRecord.save(
		function (err) {
			if (err) {
				if (err.code===11000) {
					console.log("User already exists in the database");
					return res.sendStatus (409);
					console.log("Past return point...");
				} else {
					console.log ("Some other error occured: "+err.code);
				}
			} else {
				console.log ("Saved user successfully");
			}
			req.login(user, function(err) {
				if (err) { 
					return res.sendStatus (500);
				}
			});
			return res.sendStatus(200);
		}
	);
	
});

app.post('/api/auth/logout', function (req, res) {
	console.log ('Entering POST /api/auth/logout');
	
	req.logout();

	return res.sendStatus(200);
});

app.post('/api/tweets', ensureAuthentication, function (req, res) {
	console.log ('Entering POST /api/tweets');
	var tweet = req.body.tweet;
	
	tweet['userId'] = req.user.id;
	tweet["created"]=Math.floor(Date.now()/1000);
	var shortId = require('shortid')
	tweet["id"]=shortId.generate();
	
	fixtures.tweets.push (tweet);
	
	// NNN   console.log (tweet);  
	return res.send({tweet: tweet});
});
  

app.get('/api/users/:userId', function (req, res) {
	console.log ('Entering GET /api/users/:userId');
	var userId = req.params.userId;
	
	var user = null;
	for (var i=0; i<fixtures.users.length; i++) {
		if (fixtures.users[i].id===userId) {
			user = fixtures.users[i];
		}
	}
	
	if (!user) {
		return res.sendStatus(404);
	}
	
	return res.send({user: user});
});

app.get('/api/tweets/:tweetId', function (req, res) {
	console.log ('Entering GET /api/tweets/:tweetId');
	var tweet = _.find(fixtures.tweets, 'id', req.params.tweetId);
	
	if (!tweet) {
		return res.sendStatus(404);
	}
	return res.send({tweet: tweet});
});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function (req, res) {
	console.log ('Entering DELETE /api/tweets/:tweetId');
	var delTweet = _.find(fixtures.tweets, {id: req.params.tweetId});
	if (delTweet['userId'] !== req.user.id) {
		return res.sendStatus(403);
	}
		
	var newTweets = _.remove(fixtures.tweets, {id: req.params.tweetId});
	if (newTweets.length== 0) {
		return res.sendStatus(404);
	} else {
		return res.sendStatus(200);
	}
});

app.get('/api/tweets', function(req, res) {
	console.log ('Entering GET /api/tweets');
	var userId = req.query.userId;
	console.log (userId);
	//console.log (req.params.userId);
	if (!userId) {
		return res.sendStatus(400);
	}
	var tweets = [];
	for (var i=0; i<fixtures.tweets.length; i++) {
		if (fixtures.tweets[i].userId === userId) {
			tweets.push(fixtures.tweets[i]);
		}
	}
		
	var sortedTweets = tweets.sort (function(t1, t2) {
		if (t1.crated > t2.created) {
			return -1;
		} else if (t1.created === t2.created) {
			return 0;
		} else {
			return 1;
		}
	});
	
	return res.send({tweets: sortedTweets});
});

var server = app.listen(config.get('server:port'), config.get('server:host'));

module.exports = server;