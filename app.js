var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , discordStrategy = require('passport-discord').Strategy
  , app      = express();
var GitHubStrategy = require('passport-github').Strategy;
require("dotenv").config();
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email'];
var prompt = 'consent'

passport.use(new discordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://skelly.xyz/callbackdiscord',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skelly.xyz/callbackgithub",
    scope: "user:emails"
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function() {
      return cb(null, profile)
    });
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

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/loginDiscord', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/loginGithub', passport.authenticate('github'), function(req, res) {});
app.get('/callbackdiscord',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/callbackgithub',
    passport.authenticate('github', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, function(req, res) {
    //console.log(req.user)
    res.json(req.user);
});


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