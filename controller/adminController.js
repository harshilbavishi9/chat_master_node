const path = require('path');
const admin = require('../models/admin');
const chats = require('../models/chats');
const fs = require('fs');
const nodemailer = require('nodemailer');
const mailgen = require('mailgen')

module.exports.Main = async (req,res)=>{
  if(req.isAuthenticated()){
    res.redirect('/dashboard');
    return false;
  }
  res.render('main',{
    msg : ''
  });
}

module.exports.Login = (req,res)=>{
  return res.render('dashboard')
}

module.exports.Search = async (req,res)=>{
  let id = req.user.id;
  let search = req.query.search;
  let admins = await admin.find({_id : {$nin : [id]},
    $or : [
      {username : {$regex : '.*'+search+'.*'}}
    ]
  });
  res.status(200).json(admins);
}

module.exports.AllUser = async (req,res)=>{
  let search = '';
  let page = 1;
  let per = 4;
  if(req.query.search) {
    search = req.query.search;
  }
  if(req.query.page) {
    page = JSON.parse(req.query.page);
  }

  let admins = await admin.find({
    $or : [
      {username : {$regex : '.*'+search+'.*'}}
    ]
  }).skip((page-1)*per).limit(per).exec();

  let total = await admin.find({
    $or : [
      {username : {$regex : '.*'+search+'.*'}}
    ]
  }).countDocuments();

  res.render('all_users',{
    admins : admins,
    cur : page,
    next : page + 1,
    prev : page - 1,
    search : search,
    total : Math.ceil(total/per),
  });
}

module.exports.Dashboard = async (req,res)=>{
  let id = req.user.id;
  let adata = await admin.findById(req.session.passport.user);
  let data = await admin.find({_id : {$nin : [id]}}).sort({totalChat : -1});

  res.render('dashboard',{
    admin : adata,
    admins : data,
  });
}

module.exports.Profile = async (req,res)=>{
  let id = req.params.id;
  let adata = await admin.findById(id);
  res.render('profile',{
    admin : adata,
    msg : ''
  });
}

module.exports.Register = async (req,res)=>{
  res.render('register',)

}

module.exports.RegisterAdmin = async (req,res) =>{
  let a = [];
  let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
  if(req.body.username == ''){
   console.log("Username required.");
    return false;
  }
  if(req.body.email == ''){
    console.log("Email required.");
    return false;
  }
  if(req.body.password == ''){
    console.log("Password required.");
    return false;
  }
  if(req.body.gender == ''){
    console.log("Gender required.");
    return false;
  }
  if(req.body.city == ''){
    console.log("City required.");
    return false;
  }
  if(req.body.phone == ''){
    console.log("Phone required.");
    return false;
  }
  if(req.body.img == ''){
    console.log("Img required.");
    return false;
  }
  if(req.body.address == ''){
    console.log("Address required.");
    return false;
  }
  if(req.body.password.length < 3){
    console.log("At least 3 character required in password.");
    return false;
  }
  if(req.body.phone.length != 10){
    console.log("10 character required in phone.");
    return false;
  }
  // if(req.files){
  //   let files = req.files;
  //   files.map((src,i)=>{
  //     a[i] = src.path;
  //   });
  //   req.body.imgs = a;
  // }
  if(regex.test(req.body.email)){
    if(req.body.password == req.body.cpassword){
      if(req.file){
        req.body.address= req.body.address.replace(/\s+/g, ' ').trim();
        let imgPath = admin.path+'/'+req.file.filename;
        req.body.img = imgPath;
        let email = await admin.findOne({email : req.body.email })
        let data = await admin.create(req.body); 
        if(!email){
          if(data){
            console.log("Data Inserted Successfully.");
          }
          else{
            console.log("Data not Insert Please try again.");
          }
        }
        else{
          console.log("Image not upload Some thing wrong.");
        }
      }
      else{
        console.log("Password and Confirm Password not match.");
      }
    }
    else{
      res.render('register',{suc : '',msg:"Invalid Email."});
    }
    const otp = Math.floor(Math.random() * 10000 + 100);
    console.log(otp);
    let config = {
            service : 'gmail',
            auth : {
                user: "harshilbavishi96@gmail.com",
                pass: "xtkipgmhumihtccp"
            }
        }
        let transporter = nodemailer.createTransport(config);
  
        let MailGenerator = new mailgen({
            theme: "default",
            product : {
                name: "Mailgen",
                link : 'https://mailgen.js/'
            }
          })
  
        let response = {
            body: {
                name : "OTP ",
                intro: otp,
            }
        }
  
        let mail = MailGenerator.generate(response)
        let message = {
            from : "harshilbavishi96@gmail.com",
            to : req.body.email,
            subject: "OTP is here",
            html: mail
        }
  
  
        transporter.sendMail(message).then(() => {
          console.log("otp is sent");
        }).catch(error => {
          console.log(error);
      })
          return res.render("otp");
    } else{
      console.log("email id is already login try another email id");
    }
       
}

module.exports.deleteData = async (req,res)=>{
  let fetch = await admin.findById(req.params.id);
  fetch.imgs.map((i)=>{
    fs.unlinkSync(path.join(__dirname,'../',i));
  });
  let data = await admin.findByIdAndDelete(req.params.id);
  if(data){
    res.redirect('back');
  }
  else{
    res.redirect('back');
  }
}

module.exports.updateData = async (req,res)=>{
  let data = await admin.findById(req.params.id);
  if(data){
    res.render('edit_admin',{
      data :data,
      msg : ''
    })
  }
}

module.exports.editData = async (req,res)=>{
  let a = [];
  let fetch = await admin.findById(req.body.adminId);
  let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
  if(req.body.username == ''){
    res.render('edit_admin',{data:fetch,msg:"Username required."});
    return false;
  }
  if(req.body.phone.length != 10){
    res.render('edit_admin',{data:fetch,msg:"10 character required in phone."});
    return false;
  }
  if(req.files){
    fetch.imgs.map((i)=>{
      fs.unlinkSync(path.join(__dirname,'../',i));
    });
    let files = req.files;
    files.map((src,i)=>{
      a[i] = src.path;
    });
    req.body.imgs = a;
  }
  else{
    res.render('edit_admin',{data:fetch,msg:"Images Requierd."});
    return false;
  }
  if(regex.test(req.body.email)){
    req.body.address= req.body.address.replace(/\s+/g, ' ').trim();    
    let data = await admin.findByIdAndUpdate(req.body.adminId,req.body);
    if(data){
      res.redirect('/dashboard');
    }
  }
  else{
    res.render('edit_admin',{data:fetch,msg:"Invalid Email."});
  }
}

module.exports.viewData =  async (req,res)=>{
  try {
      let data = await admin.findById(req.params.id);
      data ? res.status(200).json({success : true,data: data,msg : 'User found!'}) : res.redirect('back');
  } catch (error) {
      console.log(error);
  }
}

module.exports.sortData = async (req,res)=>{
  try {
    let id = req.user.id;
    let data = await admin.find({_id : {$nin : [id]}}).sort({totalChat : -1});
    if(data){
      res.status(200).json({success : true,data: data,msg : 'Users found!'})
    }
    else{
      res.status(400).json({success : false,msg : 'Users not found!'})
  }
  } catch (error) {
    console.log(error);
  }
}

module.exports.edit = async (req,res)=>{
  console.log(req.body);
  let adata = await admin.findById(req.user._id);
  if(req.body.caption){
    let data = await admin.findByIdAndUpdate(req.user._id, {caption : req.body.caption});
    if(data){
      res.redirect('/dashboard');
    }
    else{
      res.redirect('back');
    }
  }
  else{
    res.render('profile', {
      msg : 'Caption Required.',
      admin : adata
    });
  }
}

module.exports.otp = async(req,res)=>{
  return res.render('otp')
}

module.exports.otpvarify = async(req,res)=>{
  return res.render('main')
}