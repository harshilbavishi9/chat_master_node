const mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var PATH = ('/imgs');

const adminSchema = mongoose.Schema({
  username :{
    type : String,
    required : true
  },
  email :{
    type : String,
    required : true
  },
  password :{
    type : String,
    required : true
  },
  gender :{
    type : String,
    required : true
  },
  city :{
    type : String,
    required : true
  },
  phone :{
    type : Number,
    required : true
  },
  address :{
    type : String,
    required : true
  },
  img :{
    type : String,
    required : false
  },
  totalChat :{
    type : Number,
    default : 0
  },
  caption : {
    type :String,
    required : false
  },
  isOnline :{
    type : Boolean,
    default : false
  }
},{timestamps : true});

var storage = multer.diskStorage({
  destination : function(req, file, cb){
      cb(null, path.join(__dirname,"..",PATH));
  },
  filename : function(req, file, cb){
      cb(null, file.fieldname+"-"+Date.now());
  }
});

adminSchema.statics.upload = multer({
  storage : storage
}).single('img');

adminSchema.statics.path = PATH;

module.exports = mongoose.model('admin', adminSchema);