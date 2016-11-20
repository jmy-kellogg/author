'use strict'; 

var app = require('express')();
var path = require('path');
var session = require('express-session');
var User = require('../api/users/user.model.js');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
  clientID: '130645701499-eufrc652o4riq88sv5ld0ehh4bo03for.apps.googleusercontent.com',
  clientSecret: 'GomfVkhGyioVBMi2ikS1D_hx',
  callbackURL: 'http://127.0.0.1:8080/auth/google/callback'
}, function(token, refreshToken, profile, tiggerLogin){
  User.findOne({
    where: {
      googleId: profile.id,
    }
  })
  .then(function(user){
    if(!user){
      return User.create({
        email: profile.emails[0].value,
        googleId: profile.id,
      })
    }else{
        return user
      }
  })
  .then(function(user){
    tiggerLogin(null, user)
  }, tiggerLogin)
}));

passport.serializeUser(function(user, putOnToSession){
  putOnToSession(null, user.id)
});
passport.deserializeUser(function(id, attachReqUser){
  User.findById(id)
  .then(function(user){
    attachReqUser(null, user)
  }, attachReqUser)
})


app.use(require('./logging.middleware'));

app.use(require('./request-state.middleware'));

app.use(session({
	secret: 'shunTheBandersnatch'
}));

app.use(require('./statics.middleware'));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
  console.log('user: ', req.user);
  next();
})

// Google authentication and login 
app.get('/auth/google', passport.authenticate('google', { scope : 'email' }));

// handle the callback after Google has authenticated the user
app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect : '/', // or wherever
    failureRedirect : '/' // or wherever
  })
);

app.post('/login', function (req, res, next) {
  User.findOne({
    where: req.body
  })
  .then(function (user) {
    if (!user) {
      res.sendStatus(401);
    } else {
      //req.session.userId = user.id;
      req.login(user, function(err){
        if(err) next(err);
        else res.json(user)
      })
    }
  })
  .catch(next);
});

app.post('/signup', function (req, res, next) {
  User.create({
    email: req.body.email,
    password: req.body.password
  })
  .then(function (user) {
      //req.session.userId = user.id;
      req.login(user, function(err){
        if(err) next(err);
        else res.status(201).json(user);
      })
  })
  .catch(next);
});

app.delete('/logout', function(req, res, next){
  // delete req.session.userId
  req.logout();
  res.sendStatus(204)
});

app.get('/me', function(req, res, next){
  res.json(req.user)
})

app.use('/api', require('../api/api.router'));

var validFrontendRoutes = ['/', '/stories', '/users', '/stories/:id', '/users/:id', '/signup', '/login'];
var indexPath = path.join(__dirname, '..', '..', 'public', 'index.html');
validFrontendRoutes.forEach(function (stateRoute) {
  app.get(stateRoute, function (req, res) {
    res.sendFile(indexPath);
  });
});

app.use(require('./error.middleware'));

module.exports = app;
