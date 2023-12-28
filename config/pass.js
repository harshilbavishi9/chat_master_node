const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const admin = require('../models/admin');
const nodemailer = require("nodemailer");

passport.use('local',new passportLocal( {
  usernameField : 'email'
},async (email,password,done)=>{
  let data = await admin.findOne({email : email});
  if(data && data.password == password){
    
    return done(null,data);
  }
  else{
    console.log("Invalid password.")
    return done(null,false);
  }
}));

passport.serializeUser(async(data,done)=>{
  return done(null,data.id);
})

passport.deserializeUser(async(id,done)=>{
  let data = await admin.findById(id);
  if(data){
    return done(null,data);
  }
  else{
    return done(null,false);
  }
})

passport.check = (req,res,next)=>{
  if(req.isAuthenticated()){
    return next();
  }
  return res.redirect('/');
}

passport.setUser = (req,res,next)=>{
  if(req.isAuthenticated()){
    res.locals.user = req.data;
  }
  return next();
}

module.exports = passport;
