const mongoose = require("mongoose")

// model of user data 
const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{

        type:Number,
        required:true
    },
    is_varified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    block:{
        type:Boolean,
        default:0
    },
    cart:[{
         
        productId:{
        type:mongoose.Types.ObjectId,
        ref:'Product',
        required:true
        },
        Price:{
            type:Number,
           
        },
        qty:{

            type:Number,
            required:true 
        },
        productTotalprice:{
            type:Number,
            required:true
        }
    }],
    whishlist:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:'Product',
            requried:true
        }
    }]


})

// passing user model and db name to (User) that variable
module.exports=mongoose.model("User",userSchema)
