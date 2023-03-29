const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
  
    bannerImage:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    block:{
        type:Boolean,
        default:false,       
    },
    discription:{
        type:String,
        required:true
    },
   
})
module.exports=mongoose.model('banner',bannerSchema)