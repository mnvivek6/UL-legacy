const Category = require('../models/category');

const Product = require('../models/productmodel');
const fs = require('fs');
const User = require('../models/usersmodel')

const session = require('express-session');
const { default: mongoose } = require('mongoose');



const list_product = async (req , res)=>{
    try {
        const product = await Product.find().populate('category')
        res.render('list-product',{product});

    } catch (error) {
        console.log(error.message);
    }
}
// showing the productlist
const add_product = async( req , res )=>{

    try {
        const category = await Category.find({})
        res.render('add-product',{category})
    } catch (error) {
        console.log(error.message);
    }

   
}
// product adding method
const addproduct= async(req , res)=>{
           
    try {
        const images =[]
        for(file of req.files){
            images.push(file.filename)
        }
        const Newproduct= new Product({
            
            productname:req.body.name,
            quantity:req.body.quantity,
            price:req.body.price,
            description:req.body.description,
            category:req.body.category,
            image:images
        })
        console.log(images);   
        const result= await Newproduct.save()
           console.log(result);
        if (result) {
            res.redirect('/admin/add-product')
        }
    
    } catch (error) {
        console.log(error.message);
      
    }
   
}
// product deleting method
const deleteproduct = async ( req , res )=>{

    try {
        
        const product =  req.query.id
        console.log(product);
       const deleted= await Product.deleteOne({_id:product})
       if (deleted) {
        res.redirect('/admin/list-product')
       }
        else{
            console.log('cant delete');
        }
    } catch (error) {
        console.log(error.message);
    }
}

// product updating method
const productupdate = async( req , res )=>{

    try {
     
        const category = await Category.find()
        const product = await Product.findOne({_id:req.query.id})
        res.render('productupdate',{product:product,category})        
    } catch (error) {
        console.log(error.message);
    }
}

// edit product
const editproduct = async ( req, res )=>{

console.log('hi');
    try {
        const id=   req.query.id
        console.log(id);
        if (id) {

            await Product.updateOne({_id:id},{$set:{productname:req.body.name,
                
             category:req.body.category,
             price:req.body.price,
             description:req.body.description,
             quantity: req.body.quantity
            
            }})
        
            res.redirect('/admin/list-product')
            
        }else{
            console.log('else');
        }
    } catch (error) {
        console.log(error.message);
    }
    
   
}

// update image

// const updateimage= async ( req, res)=>{
//     try {
        
//         const id = req.params.id
//         const data= await Product.findOne({_id:id})
//         const imglength = data.image.length
//         if (imglength < 4) {
//             let images =[]
//             for(file of req.files){
//                 images.push(file.filename)
//             }
//             if (imglength+images.length<4) {                
//                 const productData = await Product.findOne({_id:id},{$addToSet:{image:{$each:images}}})
//                 res.render("list-product")
//             }
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const deleteImage= async(req, res)=>{
//     try {
        
//         const imgid= req.params.imgid
//     const prodid = req.params.prodid
   
//     fs.unlink(path.join(__dirname,'../public/img',imgid),()=>{})
//         const productimg = await Product.updateOne({_id:prodid},{$pull:{image:imgid}})
//     } catch (error) {
//         console.log(error.message);
//     }
   
// }

const AddtoCart = async(req , res)=>{

    try {
        console.log('hi');
        const productId = req.body.productId
        console.log(productId);
        const _id= await req.session.user_id
        console.log(_id);
        let exist = await User.findOne({id:session.user_id,'cart.productId':productId})

        if (exist) {
            console.log(exist);
            const user = await User.findOne({_id:req.session.user_id})
            const index = await user.cart.findIndex(data=>data.productId._id == req.body.productId)
            user.cart[index].qty +=1
            user.cart[index].productTotalprice= user.cart[index].qty*user.cart[index].Price
            await user.save()
            res.send(true)
            console.log(user);
        }else{
            const product = await Product.findOne({_id:req.body.productId})
            console.log("knhdsdho"+product.price);

            const userData = await User.findOne({_id})

            const result = await User.updateOne({_id},{$push:{cart:{productId:product._id,qty:1,price:product.price,productTotalprice:product.price}}})
             
             console.log(result);
             if (result) {
                console.log('hi');
               
                console.log('hi');
                // const category = await Category.find()
                res.json({status:true})
                res.redirect('/userhome')
                
             }else{

                console.log('adding to cart is failed it didnt updated');

             }
        }
    } catch (error) {
        console.log(error.message);
        console.log('error from addto cart');
    }
  
}
const ListCart= async(req,res)=>{

    try {
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart = await User.aggregate([{$match:{_id:temp}},{$unwind:'$cart'},{$group:{_id:null,totalcart:{$sum:'$cart.productTotalPrice'}}}])
        
        if (usercart.length >0) {

            const cartTotal = usercart[0].totalcart

            const cartTotalUpdate  = await User.updateOne({_id:userId},{$set:{cartTotalUpdate:cartTotal}})

            const userData = await User.findOne({_id:userId}).populate('cart.productId').exec()

            res.render('cartitemslisting',{userData})
        }else{
            const userData = await User.findOne({userId})
            res.render('cartitemslisting',{userData})
        }
    } catch (error) {
        console.log(error.message);
        console.log('error from list cart');
    }
}

const deleteCartProduct = async ( req, res)=>{

    try {
        console.log('hi');
        const userId = req.body.userId
        console.log(userId);
        const deleteProId= req.body.deleteProId
        console.log(deleteProId);

        const userData = await User.findByIdAndUpdate({_id:userId},{$pull:{cart:{productId:deleteProId}}})

        console.log(userData);
        if (userData) {
            
            res.json({success:true})
            res.redirect('/cartitemslisting')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const cartquantityupdation= async( req, res)=>{

try {
    
    const { user,product,count,Quantity,proPrice}=req.body

    const producttemp = mongoose.Types.ObjectId(product)
    console.log(producttemp);
    const usertemp= mongoose.Types.ObjectId(user)

    const updateQTY = await User.findOneAndUpdate({_id:usertemp,'cart.productId':producttemp},{$inc:{'cart.$.qty':count}})

    const currentqty = await User.findOne({_id:usertemp,'cart.productId':producttemp},{_id:0,'cart.qty.$':1})

    const qty = currentqty.cart[0].qty

    const singleproductprice= proPrice*qty
    console.log(proPrice);
    console.log(singleproductprice);
    await User.updateOne({_id:usertemp,'cart.productId':producttemp},{$set:{'cart.$.productTotalPrice':singleproductprice}})

    const cart = await User.findOne({_id:usertemp})

    let sum = 0
    for(let i=0; i<cart.cart.length;i++){
        sum =sum +cart.cart[i].productTotalprice
    }
    
    const update = await User.updateOne({_id:usertemp},{$set:{cartTotalPrice:sum}})
    .then(async(response)=>{
        res.json({response:true,singleproductprice,sum})
        console.log(sum);
    })
} catch (error) {
    console.log(error.message);
}
}



module.exports = {
    list_product,
    add_product,
    addproduct,
    deleteproduct,
    productupdate,
    editproduct,
    // deleteImage,
    AddtoCart,
    ListCart,
   deleteCartProduct,
   cartquantityupdation
   
}