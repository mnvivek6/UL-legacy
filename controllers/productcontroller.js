const Category = require('../models/category');

const Product = require('../models/productmodel');
const fs = require('fs');
const User = require('../models/usersmodel')

const session = require('express-session');
const { default: mongoose } = require('mongoose');

const list_product = async (req, res) => {
    try {
        const product = await Product.find().populate('category')
        res.render('list-product', { product });

    } catch (error) {
        console.log(error.message);
    }
}
// showing the productlist
const add_product = async (req, res) => {

    try {
        const category = await Category.find({})
        res.render('add-product', { category })
    } catch (error) {
        console.log(error.message);
    }


}
// product adding method
const addproduct = async (req, res) => {

    try {
        const productname=  req.body.name
        const quantity= req.body.quantity
        const price= req.body.price
        const description= req.body.description
        const category= req.body.category
        
       
        // console.log(productname);
        if (productname==''||quantity==''||price==''||description==''||category== ''||req.files=='') {
           console.log();
            const category = await Category.find({})
            res.render('add-product',{message:'please fill the field', category })
        }else{
            console.log("inn ekse");
            const images = []
            for (file of req.files) {
                images.push(file.filename)
            }
            const Newproduct = new Product({
    
                productname: req.body.name,
                quantity: req.body.quantity,
                price: req.body.price,
                description: req.body.description,
                category: req.body.category,
                image: images
    
            })
                
        const result = await Newproduct.save()
        console.log(result);
        if (result) {
            res.redirect('/admin/add-product')
        } 
                
        }
       
       
        


    } catch (error) {
        console.log(error.message);

    }

}
// product deleting method
const deleteproduct = async (req, res) => {

    try {

        const product = req.body.productId
       console.log(product,'not getting the product');
        const deleted = await Product.deleteOne({ _id: product })
       
       .then(()=>{
        res.json({success:true})
       })
       console.log(deleted);
       
           
        
    } catch (error) {
        console.log(error.message);
    }
}

// product updating method
const productupdate = async (req, res) => {

    try {

        const category = await Category.find()
        const product = await  Product.findOne({_id:req.params.id}).populate('category')
        const productcategory = product.category
        console.log(productcategory);
        
        
     
        res.render('productupdate', { product: product, category,productcategory })
    } catch (error) {
        console.log(error.message);
    }
}

// edit product
const editproduct = async (req, res) => {

    console.log('hi');
    try {
        const id = req.query.id
        console.log(req.body.category);
        console.log(id);
        if (id) {

            await Product.updateOne({ _id: id }, {
                $set: {
                    productname: req.body.name,

                    category: req.body.category,
                    
                    price: req.body.price,
                    description: req.body.description,
                    quantity: req.body.quantity

                }
            })


            res.redirect('/admin/list-product')

        } else {
            console.log('else');
        }
    } catch (error) {
        console.log(error.message);
    }


}



const AddtoCart = async (req, res) => {

    try {
       
        const productId = req.body.productId
        
        const _id = await req.session.user_id
       
        let exist = await User.findOne({ id: session.user_id, 'cart.productId': productId })

        if (exist) {
           
            res.send(false)
           
        } else {
            const product = await Product.findOne({ _id: req.body.productId })
           
            const userData = await User.findOne({ _id })

            const result = await User.updateOne({ _id }, { $push: { cart: { productId: product._id, qty: 1, price: product.price, productTotalprice: product.price } } })
         
            if (result) {
                res.json({ status: true })
                res.redirect('/userhome')

            } else {

                console.log(' adding to cart is failed it didnt updated');

            }
        }
    } catch (error) {
        console.log(error.message);
        console.log('error from addto cart');
        res.render(500)
    }

}
const ListCart = async (req, res) => {

    try {
    
        const userId = req.session.user_id
        const temp = mongoose.Types.ObjectId(req.session.user_id)
        const usercart = await User.aggregate([{ $match: { _id: temp } }, { $unwind: '$cart' }, { $group: { _id: null, totalcart: { $sum: '$cart.productTotalprice' } } }])
       console.log(usercart,'usercart');
        if (usercart.length > 0) {
            const cartTotal = usercart[0].totalcart            
            const cartTotalUpdate = await User.updateOne({ _id: userId }, { $set: { cartTotalPrice: cartTotal } })         
            const userData = await User.findOne({ _id: userId }).populate('cart.productId').exec()
            const user = true
            res.render('cartitemslisting',{ userData,user })
        } else {
            const userData = await User.findOne({ userId })
            const user = true
            res.render('cartitemslisting',{ userData,user })
        }
    } catch (error) {
        console.log(error.message);
        console.log('error from list cart');
        res.render('500')
    }
}

const deleteCartProduct = async (req, res) => {

    try {
        console.log('hi');
        const userId = req.body.userId
        console.log(userId);
        const deleteProId = req.body.deleteProId
        console.log(deleteProId);

        const userData = await User.findByIdAndUpdate({ _id: userId }, { $pull: { cart: { productId: deleteProId } } })

        console.log(userData);
        if (userData) {

            res.json({ success: true })
            res.redirect('/cartitemslisting')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const cartquantityupdation = async (req, res) => {
    try {
      const { user, product, count, Quantity, proPrice } = req.body;
  
      const producttemp = mongoose.Types.ObjectId(product);
      const productqty = await Product.findOne({ _id: producttemp }, { quantity: 1 });
      const requestedQty = count + Quantity;
  
      const usertemp = mongoose.Types.ObjectId(user);
  
      const updateQTY = await User.findOneAndUpdate(
        { _id: usertemp, 'cart.productId': producttemp },
        { $inc: { 'cart.$.qty': count } }
      );
  
      const currentqty = await User.findOne(
        { _id: usertemp, 'cart.productId': producttemp },
        { _id: 0, 'cart.qty.$': 1 }
      );
      const qty = currentqty.cart[0].qty;
  
      const singleproductprice = proPrice * qty;
  
      await User.updateOne(
        { _id: usertemp, 'cart.productId': producttemp },
        { $set: { 'cart.$.productTotalprice': singleproductprice } }
      );
      const cart = await User.findOne({ _id: usertemp });
  
      let sum = 0;
      for (let i = 0; i < cart.cart.length; i++) {
        sum = sum + cart.cart[i].productTotalprice;
      }
  
      const update = await User.findOneAndUpdate(
        { _id: usertemp },
        { $set: { cartTotalPrice: sum } }
      );
  
      if ( qty >=productqty.quantity) {
        res.json({ response: false, message: 'Product out of stock.' });
      } else {
        res.json({ response: true, singleproductprice, sum });
      }
    } catch (error) {
      console.log(error.message);
      res.render('500');
    }
  };


module.exports = {
    list_product,
    add_product,
    addproduct,
    deleteproduct,
    productupdate,
    editproduct,
    AddtoCart,
    ListCart,
    deleteCartProduct,
    cartquantityupdation

}