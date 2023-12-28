const multer = require('multer');

const imgs = multer.diskStorage({
  destination : (req,file,cb)=>{
    cb(null,'imgs');
  },
  filename : (req,file,cb)=>{
    cb(null,file.fieldname+'-'+Date.now());
  }
});

module.exports = multer({storage : imgs});