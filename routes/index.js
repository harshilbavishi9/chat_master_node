const express = require('express');
const routes = express.Router();
const passport = require('passport');
const admin = require('../models/admin');
const adminController = require('../controller/adminController');
// const imgs = require('../config/img');

routes.get('/', adminController.Main);
routes.post('/Login',passport.authenticate('local', {failureRedirect : '/'}), adminController.Login);
routes.get('/dashboard',passport.check, adminController.Dashboard);
routes.get('/search', adminController.Search);
routes.get('/all_users', adminController.AllUser);
routes.get('/sort_users', adminController.sortData);
routes.get('/profile/:id',passport.check, adminController.Profile);
routes.get('/register', adminController.Register);
routes.post('/register',admin.upload, adminController.RegisterAdmin);
routes.get('/view_data/:id', adminController.viewData);
routes.get('/deleteData/:id', adminController.deleteData);
routes.get('/updateData/:id',passport.check, adminController.updateData);
routes.post('/editData', adminController.editData);
routes.post('/edit', adminController.edit);
routes.get('/otp',adminController.otp)
routes.post('/otpvarify',adminController.otpvarify )
routes.get('/logout', async (req,res)=>{
  req.logout((err)=>{
    if(err)
    {
      console.log(err);
      return false;
    }
    res.clearCookie('admin');
    res.redirect('/');
  })
});
routes.use('/chat', require('./chat'));

module.exports = routes;