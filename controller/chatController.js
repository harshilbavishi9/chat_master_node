const chat = require('../models/chats');
const admin = require('../models/admin');

module.exports.AddChat = async (req,res) =>{
    try {
        let rData = await admin.findById(req.body.receiverId);
        let sData = await admin.findById(req.body.senderId);
        let data = await chat.create(req.body);
        await admin.findByIdAndUpdate(req.body.receiverId, {totalChat : rData.totalChat + 1});
        await admin.findByIdAndUpdate(req.body.senderId, {totalChat : sData.totalChat + 1});
        data ? res.status(200).send({success : true,data: data,msg : 'Chat inserted!'}) : res.redirect('back');
    } catch (error) {
        console.log(error);
    }
}