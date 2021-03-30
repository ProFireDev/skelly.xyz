const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SkellyServices', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var User
db.once('open', function() {
  // we're connected!
  const userSchema = new mongoose.Schema({
    githubId: String,
    discordId: String,
    stackId: String,
    googleId: String,
    redditId: String,
    twitterId: String,
    primaryEmail: String,
    githubEmail: String,
    discordEmail: String,
    googleEmail: String,
    twitterEmail: String,
    redditEmail: String,
    stackEmail: String,
    VCP: Boolean,
    Patron: Boolean,
    Salad: Boolean,
    LinkedAccounts: Array,
    tokens: Object
  });
  User = mongoose.model('User', userSchema);
});


function findOrCreate(service, profile, callback) {
    switch (service) {
        case "google":
            console.log("google")
            console.log(profile.id);
            User.countDocuments({googleId:profile.id},function(err, res){
                if (res) {
                    console.log("User Exists")
                    return User.find({googleId:profile.id}, function(err, user) {
                        console.log(user)
                        if(!err) callback(user)
                        if(err) console.log(err)
                    })
                } else {
                    let user = new User({
                        googleId:profile.id,
                        googleEmail:profile.emails[0].value,
                        primaryEmail:profile.emails[0].value,
                        LinkedAccounts: ["google"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })
        break;
        case "twitter":
            console.log("twitter")
            console.log(profile.id);
            User.countDocuments({twitterId:profile.id},function(err, res){
                if (res) {
                    console.log("User Exists")
                    return User.find({twitterId:profile.id}, function(err, user) {
                        console.log(user)
                        if(!err) callback(user)
                        if(err) console.log(err)
                    })
                } else {
                    let user = new User({
                        twitterId:profile.id,
                        twitterEmail:profile.emails[0].value,
                        primaryEmail:profile.emails[0].value,
                        LinkedAccounts: ["twitter"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })
        break;
        case "github":
            console.log("github")
            console.log(profile.id);
            User.countDocuments({githubId:profile.id},function(err, res){
                if (res) {
                    console.log("User Exists")
                    return User.find({githubId:profile.id}, function(err, user) {
                        console.log(user)
                        if(!err) callback(user)
                        if(err) console.log(err)
                    })
                } else {
                    let user = new User({
                        githubId:profile.id,
                        githubEmail:profile.email,
                        primaryEmail:profile.email,
                        LinkedAccounts: ["github"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })
        break;
        case "reddit":
            User.countDocuments({redditId:profile.id},function(err, res){
                console.log(res)
                if (res) {
                    console.log("User Exists")
                    return User.find({redditId:profile.id}, function(err, user) {
                        console.log(user)
                        if(!err) callback(user)
                        if(err) console.log(err)
                    })
                } else {
                    let user = new User({
                        redditId:profile.id,
                        redditEmail:profile.email,
                        primaryEmail:profile.email,
                        LinkedAccounts: ["reddit"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })

        break;
        case "stack-exchange":
            console.log("stack")
            console.log(profile.id);
            User.countDocuments({stackId:profile.id},function(err, res){
                if (res) {
                    console.log("User Exists")
                    return User.find({stackId:profile.id}, function(err, user) {
                        user.stackEmail = profile.email;
                        user.save(function (err,user) {
                            if(!err) callback(user)
                            if(err) console.log(err)
                        })
                    })
                } else {
                    let user = new User({
                        stackId:profile.id,
                        stackEmail:profile.email,
                        primaryEmail:profile.email,
                        LinkedAccounts: ["stack-exchange"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })
        break;
        case "discord":
            console.log("discord")
            console.log(profile.id);
            
            User.countDocuments({discordId:profile.id},function(err, res){
                if (res) {
                    console.log("User Exists")
                    return User.find({discordId:profile.id}, function(err, user) {
                        console.log(user)
                        if(!err) callback(user)
                        if(err) console.log(err)
                    })
                } else {
                    let user = new User({
                        discordId:profile.id,
                        discordEmail:profile.email,
                        primaryEmail:profile.email,
                        LinkedAccounts: ["discord"]
                    })
                    user.save(function (err, user) {
                        if (err) return console.error(err);
                        callback(user)
                      });
                }
            })
    }
}

function hasEmail(user, callback) {
    if (user.provider == "reddit") {
        User.find({redditId:user.id}, function(err, user) {
            let usr = user[0]
            if (usr.primaryEmail) {
                callback(true);
            } else {
                callback(false)
            }
        })
    }
    if (user.provider == "stack-exchange") {
        User.find({stackId:profile.id}, function(err, user) {
            if (user.primaryEmail) {
                callback(true);
            } else {
                callback(false)
            }
        })
    }
}
function exists(profile, callback) {
    User.countDocuments({redditId:profile.id},function(err, res){
        if (res) {
            callback(true)
        } else {
            callback(false)
            User.countDocuments({stackId:profile.id},function(err, res){
                if (res) {
                    callback(true)
                } else {
                    callback(false)
                }
            })
        }

    })
}
module.exports = {
    findOrCreate: findOrCreate,
    hasEmail: hasEmail,
    exists: exists,
}