var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , Strategy = require('passport-discord').Strategy
  , app      = express();
require("dotenv").config();
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email', 'guilds.join'];
var prompt = 'consent'

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://84.240.100.113:8001/callback',
    scope: scopes,
    prompt: prompt
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

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
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
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


app.listen(process.env.PORT, function (err) {
    if (err) return console.log(err)
    console.log('Listening at http://localhost:' + process.env.PORT)
})