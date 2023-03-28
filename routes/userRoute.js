const express = require("express")
const user_route = express.Router()
const config = require('../config/config')
const session = require('express-session')


user_route.use(session({
  secret: config.sessionSecret,
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 500000000000000000000000000000
  }
}));


const auth = require('../middleware/auth')

// user_route.set('views engine','ejs')
// user_route.set('views','./views/users')
const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({ extended: true }))
// requiring user controller here


const userController = require("../controllers/userController")
const productController = require('../controllers/productcontroller')

user_route.get('/signup', auth.isLogout, userController.loadRegister)

user_route.post('/signup', auth.isLogout, userController.insertUser)

user_route.get('/login', auth.isLogout
  , userController.loginLoad)

user_route.get('/userhome', auth.isLogin, userController.homepage)
user_route.get('/logout', userController.userLogout)


user_route.post('/login', userController.verifylogin)

user_route.get('/', auth.isLogout, userController.loadhome)

user_route.get('/forget', userController.forgetload)

user_route.post('/forget', userController.forgetVerify)

user_route.get('/forget-password', userController.forgetpasswordload)

user_route.post('/forget-password', userController.resetPassword)

user_route.get('/verify', userController.verifymail)

user_route.get('/login', userController.loginLoad)
// otp
user_route.post('/verification-form', userController.verifyPhone)
user_route.get('/verification-form', userController.otpPage)
user_route.post('/otp', userController.verifyOtp)

user_route.get('/productdetail', auth.isLogin, userController.productdetail)

// cart
user_route.post('/add-to-cart', auth.isLogin, productController.AddtoCart)
user_route.get('/listcart',auth.isLogin, productController.ListCart)
user_route.post('/deletecartproduct',auth.isLogin, productController.deleteCartProduct)
user_route.post('/changequantity',auth.isLogin, productController.cartquantityupdation)

// profile 
user_route.get('/userprofile', auth.isLogin, userController.userProfile)
user_route.get('/address', auth.isLogin, userController.showaddress)
user_route.post('/ad-address', auth.isLogin, userController.addingAddress)
user_route.get('/editaddress/:id/:adrsId', auth.isLogin, userController.editAddress)
user_route.post('/updateaddress/:addressIndex', auth.isLogin, userController.editandupdateaddress)
user_route.get('/delete-address/:id/:addressIndex',auth.isLogin,userController.DeleteAddress)


// whishlist
user_route.get('/whishlist', auth.isLogin, userController.loadwhishlist)
user_route.post('/addtowhishlist', auth.isLogin, userController.AddTowishlist)
user_route.get('/deletewhishlist',auth.isLogin, userController.deletewhishlist)

// orders
user_route.get('/checkout',auth.isLogin,userController.loadCheckout)
// user_route.get('/shipping',auth.isLogin,userController.shipping)
user_route.post('/add-checkout-address',auth.isLogin,userController.addAddressCheckout)
user_route.post('/placeorder',auth.isLogin,userController.placeorder)
user_route.get('/ordersuccess',auth.isLogin,userController.ordersuccess)
user_route.get('/orderlist',auth.isLogin,userController.orderlist)
user_route.get('/cancelorder',auth.isLogin,userController.OrderCancel)

// pagenation
user_route.get('/pagenation',userController.pagenation)



// user_route.get('/verification',userController.verificationload)

// user_route.post('/verification',userController.sentverificationlink)

module.exports = user_route 