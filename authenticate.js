var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy(User.authenticate()));
//Support for session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());