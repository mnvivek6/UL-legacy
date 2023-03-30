const mongoose = require('mongoose')
const { Number } = require('twilio/lib/twiml/VoiceResponse')

const couponSchema = new mongoose.Schema({

    couponCode:{

        type:String,
        required:true
    },                 
    couponAmountType:{      
        type:String,
        required:true
    },
    couponAmount:{
        type:Number,
        required:true,
    },
    minCartAmount:{
        type:Number,
        required:true
    },
    minRedeemAmount:{
        type:Number,
        required:true,
    },
    startDate:{
        type:Date
    },
    expiryDate:{
        type:Date
    },
    limit:{
        type:Number,
        required:true
    },
    used:{
        type:Array,
        
    },
    disable:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


module.exports = mongoose.model('Coupon',couponSchema)