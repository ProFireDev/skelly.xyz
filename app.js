var express  = require('express')
  , session  = require('express-session')
  , passport = require('passport')
  , DiscordStrategy = require('passport-discord').Strategy
  , app      = express();
const crypto = require("crypto");
var GitHubStrategy = require('passport-github').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var db = require('./db')
var fetch = require("node-fetch")
require("dotenv").config();
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var scopes = ['identify', 'email'];
var prompt = 'consent'
app.set("view egine", "ejs")
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
    fetch("https://api.github.com/user/emails", {
						headers: {
              Accept: "application/json",
							Authorization: `token ${accessToken}`,
						},
		}).then(res => res.json()).then(res => {
      let filtered = res.reduce((a, o) => (o.primary && a.push(o.email), a), [])      
      profile.email = filtered[0]
    }).then (h => {
      db.findOrCreate(profile.provider, profile, function(user) {
        cb(null, user)
      })
    })
    
  }
));
passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "https://skelly.xyz/callbacktwitter",
    userProfileURL  : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
  },
  function(token, tokenSecret, profile, cb) {
    db.findOrCreate(profile.provider, profile, function(user) {
      cb(null, user)
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
app.use("/resources", express.static('public/resources'))
app.use("/.well-known", express.static('public/.well-known'))
app.use(express.urlencoded({extended:true}));

app.get('/login', function(req, res) {
  if(req.user) {
    console.log(req.user)
    if(req.user.primaryEmail) {
      res.render(__dirname + '/public/login.ejs', {primaryEmail: req.user.primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user.primaryEmail.toLowerCase()).digest("hex")});
    } else {
      if(req.user[0].primaryEmail) {
        res.render(__dirname + '/public/login.ejs', {primaryEmail: req.user[0].primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user[0].primaryEmail.toLowerCase()).digest("hex")});
      }
    }
    } else {
      res.render(__dirname + '/public/login.ejs', {primaryEmail: "", gravatarHash: ""})
    }
});
app.get("/index", (req, res) => {
  res.send("Hello world")
})

app.get("/profile", checkAuth, function (req, res) {
  if(req.user) {
    console.log(req.user)
    if(req.user.primaryEmail) {
      res.render(__dirname + '/public/profile.ejs', {primaryEmail: req.user.primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user.primaryEmail.toLowerCase()).digest("hex")});
      } else {
        if(req.user[0].primaryEmail) {
          res.render(__dirname + '/public/profile.ejs', {primaryEmail: req.user[0].primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user[0].primaryEmail.toLowerCase()).digest("hex")});
        }
      }
      } else {
        res.render(__dirname + '/public/profile.ejs', {primaryEmail: ""})
      }
});

app.get('/', function(req, res) {
  if(req.user) {
  console.log(req.user)
  if(req.user.primaryEmail) {
    res.render(__dirname + '/public/index.ejs', {primaryEmail: req.user.primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user.primaryEmail.toLowerCase()).digest("hex")});
    } else {
      if(req.user[0].primaryEmail) {
        res.render(__dirname + '/public/index.ejs', {primaryEmail: req.user[0].primaryEmail, gravatarHash: crypto.createHash("md5").update(req.user[0].primaryEmail.toLowerCase()).digest("hex")});
      }
    }
    } else {
      res.render(__dirname + '/public/index.ejs', {primaryEmail: ""})
    }
});


app.get('/loginDiscord', passport.authenticate('discord', { scope: scopes, prompt: prompt }), function(req, res) {});
app.get('/loginGithub', passport.authenticate('github'), function(req, res) {});
app.get('/loginTwitter', passport.authenticate('twitter'), function(req, res) {});
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
app.get('/callbackgoogle',
    passport.authenticate('google', { failureRedirect: '/' }), function(req, res) { res.redirect('/info') } // auth success
);
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('/info', checkAuth, function(req, res) {
    //console.log(req.user
    res.redirect("/")
    //db.findOrCreate(req.user.provider, req.user)

});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login")
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