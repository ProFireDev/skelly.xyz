var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , DiscordStrategy = require('passport-discord').Strategy
  , app      = express();
var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var RedditStrategy = require('passport-reddit').Strategy;
var StackExchangeStrategy = require('passport-stack-exchange');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var db = require('./db')
require("dotenv").config();
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email'];
var prompt = 'consent'

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://skelly.xyz/callbackdiscord',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
  db.findOrCreate(profile.provider, profile, function(user) {
    done(null, user)
  })
}));
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skelly.xyz/callbackgithub",
    scope: ["user:email"]
  },
  function(accessToken, refreshToken, profile, cb) {
    db.findOrCreate(profile.provider, profile, function(user) {
      cb(null, user)
    })
  }
));
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "https://skelly.xyz/callbacktwitter"
  },
  function(token, tokenSecret, profile, cb) {
    db.findOrCreate(profile.provider, profile, function(user) {
      cb(null, user)
    })
  }
));
passport.use(new RedditStrategy({
    clientID: process.env.REDDIT_CONSUMER_KEY,
    clientSecret: process.env.REDDIT_CONSUMER_SECRET,
    callbackURL: "https://skelly.xyz/callbackreddit",
    state: "auth",
    scope: ["identity"]
  },
  function(accessToken, refreshToken, profile, done) {
    db.findOrCreate(profile.provider, profile, function(user) {
      done(null, user)
    })
  }
));
passport.use(new StackExchangeStrategy({
    clientID: process.env.STACKEXCHANGE_CLIENT_ID,
    clientSecret: process.env.STACKEXCHANGE_CLIENT_SECRET,
    callbackURL: 'https://skelly.xyz/callbackstackexchange',
    stackAppsKey: process.env.STACKEXCHANGE_APPS_KEY,
    scope: ["private_info"],
    site: 'stackoverflow'
  },
  function(accessToken, refreshToken, profile, done) {
    db.findOrCreate(profile.provider, profile, function(user) {
      done(null, user)
    })
  }
));
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skelly.xyz/callbackgoogle",
    scope: ["profile", "email"]
  },
  function(token, tokenSecret, profile, cb) {
    
    db.findOrCreate(profile.provider, profile, function(user) {
      cb(null, user)
    })
  }
));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public/'))
app.use(express.urlencoded({extended:true}));

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/loginDiscord', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/loginGithub', passport.authenticate('github'), function(req, res) {});
app.get('/loginTwitter', passport.authenticate('twitter'), function(req, res) {});
app.get('/loginReddit', passport.authenticate('reddit'), function(req, res) {});
app.get('/loginStackExchange', passport.authenticate('stack-exchange'), function(req, res) {});
app.get('/loginGoogle', passport.authenticate('google'), function(req, res) {});
app.get('/callbackdiscord',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/callbackgithub',
    passport.authenticate('github', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/callbacktwitter',
    passport.authenticate('twitter', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/callbackreddit',
passport.authenticate('reddit', { failureRedirect: '/' }), function(req, res) { res.redirect('/addEmail') } // auth success
);
app.get('/callbackstackexchange',
passport.authenticate('stack-exchange', { failureRedirect: '/' }), function(req, res) { res.redirect('/addEmail') } // auth success
);
app.get('/callbackgoogle',
    passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, function(req, res) {
    //console.log(req.user)
    res.json(req.user);
    db.findOrCreate(req.user.provider, req.user)

});
app.get('/addEmail', checkAuth, function(req, res) {
  //console.log(req.user)
  res.sendFile(__dirname + '/public/addEmail.html');
  
});

app.post('/addEmail', checkAuth, function(req, res) {
  console.log(req.body);
  req.user.email = req.body.email;
  res.redirect('/info')
  
})


function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send('not logged in :(');
}


var fs = require('fs');
var http = require('http');
var https = require('https');
var key = fs.readFileSync("./privkey.pem");
var cert = fs.readFileSync("./cert.pem");
var ca = fs.readFileSync("./chain.pem");

const credentials = {
	key: key,
	cert: cert,
	ca: ca
};


const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});