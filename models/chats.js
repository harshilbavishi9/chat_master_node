const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  senderId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'admin',
    required : true
  },
  receiverId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'admin',
    required : true
  },
  msg :{
    type : String,
    required : true
  },
  msgtime : {
    type : String,
    required : true
  }
},{timestamps : true});

module.exports = mongoose.model('chat', chatSchema);