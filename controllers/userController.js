// setting rout
const User = require('../models/usersmodel')
const bcrypt = require('bcrypt');

const nodemailer = require('nodemailer');
const config = require('../config/config')
const { res } = require('../routes/userRoute');
const randomstring = require('randomstring');
const { use } = require('bcrypt/promises');
const Product = require('../models/productmodel');
const Category = require('../models/category');
const Order = require('../models/orderModel')
// const Address = require('../models/addressModel');
const Address = require('../models/addressModel');
const { response } = require('express');
const { default: mongoose } = require('mongoose');
const Coupon = require('../models/couponModel')
const Razorpay= require('razorpay')
const crypto = require('crypto')
const Banner = require('../models/bannerModel')


require('dotenv').config()

const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
})


// bcrypt the password for security
// console.log("khgfkgdkhgc");
const Securepassword = async (password) => {
    console.log("come pass");
    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        // console.log("password");
        console.log(error.message);
    }

}
// for send verification mail
const sendVeryfymail = async (name, email, user_id) => {

    try {
        const transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            tls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'for verification mail',
            html: '<p>hii' + name + ',please click here to <a href="http://localhost:3000/verify?id=' + user_id + '" >verify</a>your mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:-', info.res);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

// for reset password send to mail
const sendResetPasswordmail = async (name, email, token) => {

    try {
        const transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            tls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        })
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'for reset password',
            html: '<p>hii  ' + name + ',please click here to <a href="http://localhost:3000/forget password?token=' + token + '" > Reset </a>forget your password.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:-', info.res);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

const loadRegister = async (req, res) => {

    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {

    try {
        // console.log(req.body.password);
        const spassword = await Securepassword(req.body.password);
        const NEwUser = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            is_admin: 0
        })
        console.log(NEwUser);
        const userData = await NEwUser.save()
        if (userData) {
            sendVeryfymail(req.body.name, req.body.email, userData._id)
            res.render('userlogin', { message: "your registration has been successfull" })
        } else {
            res.render('signup', { message: "your registration has been failed" })
        }
    } catch (error) {
        console.log(error.message);
    }

}

// login user method
const loginLoad = async (req, res) => {

    try {

        res.render('userlogin')

    } catch (error) {

        console.log(error.message);
    }


}
const verifylogin = async (req, res) => {

    try {
        const products = await Product.find()
        const category = await Category.find()
        const email = req.body.email;
        const password = req.body.password

        const userData = User.findOne({ email: email })
            .then((userData) => {
                if (userData) {
                    bcrypt.compare(password, userData.password).then((data) => {

                        const passwordMatch = data
                        if (passwordMatch) {


                            if (userData.is_varified == 0) {

                                res.render('userlogin', { message: 'Please Verify Your Mail' })

                            } else if (userData.is_admin == 1) {
                                res.render('userlogin', { message: 'Admins Cannot access user side' })

                            } else if (userData.block == 1) {
                                res.render('userlogin', { message: 'Oops sorry unfortunately we just blocked you please chech your mail' })
                            }

                            else {
                                req.session.user_id = userData._id
                                console.log(req.session.user_id);

                                res.redirect('/userhome')
                            }
                        } else {
                            res.render('userlogin', { message: "Email and password is incorrect" })
                        }
                    })

                } else if (password === "" || email === "") {

                    res.render('userlogin', { message: "Enter Valid Inputs" })
                } else {
                    res.render('userlogin', { message: 'Your Email and Password is incorrect' })
                }
            })



    } catch (error) {
        console.log(error.message);
    }
}

const loadhome = async (req, res) => {

    try {
        const category = await Category.find()
        const BannerData = await Banner.find({type:'first carosal'})
        const Middlebanner = await Banner.find({type:'middle offer'})
        const lastbanner = await Banner.find({type:'Last One'})
        console.log(BannerData);
        const products = await Product.find()
        const user = true

        // console.log(products);
       
        res.render('userhome', { products, category, user,BannerData,Middlebanner,lastbanner })
    } catch (error) {
        console.log(error.message);
    }
}
const homepage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const category = await Category.find()
            const BannerData = await Banner.find({type:'first carosal'})
            const Middlebanner = await Banner.find({type:'middle offer'})
            const lastbanner = await Banner.find({type:'Last One'})
            const products = await Product.find()
            const user = false
            // console.log(products);
            console.log("loading userhome");
            res.render('userhome', { products, category, user ,BannerData,Middlebanner,lastbanner })
        }

    } catch (error) {
        console.log();
    }
}

// for mailverification
const verifymail = async (req, res) => {

    try {
        const updateinfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } })

        console.log(updateinfo);
        res.render("email")

    } catch (error) {
        console.log(error.message);

    }
}

// logout
const userLogout = async (req, res) => {
    try {
        req.session.user_id = null
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}
const forgetLoad = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

// foget password
const forgetload = async (req, res) => {
    console.log("hay");
    try {

        res.render('forget')

    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {

    try {

        const email = req.body.email
        const userData = await User.findOne({ email: email })
        if (userData) {
            console.log(userData);
            if (userData.is_varified === 0) {
                res.render('forget', { message: "please verify your mail" })
            } else {
                const randomString = randomstring.generate();
                console.log(randomString);
                const updateData = await User.updateOne({ email: email }, { $set: { token: randomString } })
                console.log(updateData);
                sendResetPasswordmail(userData.name, userData.email, randomString)
                res.render('forget', { message: "Please check your mail to reset your password" })

            }


        } else {
            res.render('forget', { message: "user email is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}
// forget password 
const forgetpasswordload = async (req, res) => {

    try {
        const token = req.query.token
        const tokenData = User.findOne({ token: token })
        if (condition) {
            res.render('forget', { user_id: tokenData._id })

        } else {
            res.render('404', { message: "token is invalid" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

// reset password
const resetPassword = async (req, res) => {

    try {

        const password = req.body.password
        const user_id = req.body.user_id

        const secure_password = await Securepassword(password)
        const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

const otpPage = async (req, res) => {

    try {

        res.render('phoneverification')

    } catch (error) {
        console.log(error.message);
    }
}


const verifyPhone = async (req, res) => {

    try {

        const num = await req.body.number
        const check = await User.findOne({ mobile: num })
        if (check) {

            const otpres = await client.verify.v2.services(TWILIO_SERVICE_SID).verifications.create({
                to: `+91${num}`,
                channel: "sms"
            })
            res.render('otp', { message: "", number: num })
        } else {
            res.render('phoneverification', { message: 'did not register this mobile number' })
        }
    } catch (error) {
        console.log(error.message);
        console.log('verifyPhone');
    }
}

const verifyOtp = async (req, res) => {

    try {
        console.log('hi');
        const num = req.body.mno
        const otpp = req.body.otp
        const otp = otpp.join("")
        const verifiedres = await client.verify
            .v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({

                to: `+91${num}`,
                code: otp,
            })
        if (verifiedres.status == 'approved') {

            const userdetails = await User.findOne({ mobile: num })

            // req.session.user_id = userdetails
            res.redirect('/home')
        }
        else {
            res.render('otp', { message: 'incorrect otp' })
            console.log('incorrect otp');
        }
    } catch (error) {
        console.log(error.message);
        console.log('we got error from verify otp');
    }
}

const productdetail = async (req, res) => {

    try {

        const proid = req.query.id
        console.log(proid);
        const product = await Product.findOne({ _id: proid })
        const products= await Product.find()

        const user= true
       
        res.render('productdetails', { product,products,user })
    } catch (error) {
        console.log(error.message);
       res.render('500')
    }
}

const userProfile = async (req, res) => {

    try {

        const userId = await req.session.user_id
        const userData = await User.findOne({ _id: req.session.user_id })
        const user= true
        res.render('userprofile', { userData,user })

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const addingAddress = async (req, res) => {

    try {
        if (req.session.user_id) {

            const userId = await req.session.user_id
            console.log(userId);
            let addressObj = {

                fullname: req.body.fullname,
                mobileNumber: req.body.number,
                pincode: req.body.zip,
                houseAddress: req.body.houseAddress,
                streetAdress: req.body.streetAdress,
                landMark: req.body.landmark,
                cityName: req.body.city,
                state: req.body.state
            }
            console.log(addressObj);
            const userAddress = await Address.findOne({ userId: userId })

            if (userAddress) {

                const useraddrs = await Address.findOne({ userId: userId }).populate('userId').exec()
                console.log(useraddrs);
                useraddrs.userAddresses.push(addressObj)
                await useraddrs.save().then((response) => {
                    res.redirect('/userprofile')
                }).catch((err) => {
                    res.send(err)
                })


            } else {
                console.log('hi');

                let useraddressobj = {

                    userId: userId,
                    useraddresses: [addressObj]
                }
                console.log(useraddressobj);
                await Address.create(useraddressobj).then((response) => {
                    res.redirect('/userprofile')
                })
            }

        }


    } catch (error) {
        console.log(error.message);
        console.log('error from adding address');
        res.render('500')
    }
}

const showaddress = async (req, res) => {

    try {
        // const userData = await User.findOne({_id:req.session.user_id})
        const address = await Address.findOne({ userId: req.session.user_id })
        const user = true

        res.render('address', { address,user })
    } catch (error) {
        console.log(error.message);
        console.log('error from showaddress');
        res.render('500')

    }
}

const editAddress = async (req, res) => {

    try {

        const adrsSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const address = mongoose.Types.ObjectId(adrsSchemaId)
        const addresses = mongoose.Types.ObjectId(adrsId)

        const addressData = await Address.findOne({ address })

        const addressIndex = await addressData.userAddresses.findIndex(data => data.id == addresses)

        const editAddress = addressData.userAddresses[addressIndex]
        console.log("address");
        console.log(editAddress);

        res.render('addressedit', { editAddress, addressIndex })
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const editandupdateaddress = async (req, res) => {

    try {

        const addressIndex = req.params.addressIndex
        console.log(addressIndex);
        const editData = { ...req.body }
        console.log(editData);
        const userId = req.session.user_id
        const updateAdrs = await Address.findOne({ userId })
        updateAdrs.userAddresses[addressIndex] = { ...editData }

        await updateAdrs.save()
        res.redirect('/address')

    } catch (error) {
        console.log(error.message);
        console.log('error from editand update address its not working');
        res.render('500')
    }

}

const DeleteAddress = async (req, res) => {

    try {

        const adrSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const addressId = mongoose.Types.ObjectId(adrSchemaId)
        const addresses = mongoose.Types.ObjectId(adrsId)

        const addressData = await Address.findOne({ addressId })

        const addressIndex = await addressData.userAddresses.findIndex(data => data.id == addresses)
        addressData.userAddresses.splice(addressIndex, 1)

        await addressData.save()

        res.redirect('/userprofile')

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const AddTowishlist = async (req, res) => {

    try {
      
        const productId = req.body.productId
        

        let exist = await User.findOne({ id: req.session.user_id, 'whishlist.product': productId })
      

        if (exist) {
            res.json({ status: false })
        } else {
           
            const product = await Product.findOne({ _id: req.body.productId })
          
            console.log(product);

            const _id = req.session.user_id
            console.log("user");
            console.log(_id);
            const userData = await User.findOne({ _id })


            const result = await User.updateOne({ _id }, { $push: { whishlist: { product: product._id } } })
            console.log(result);
            if (result) {
                res.json({ status: true })
                console.log('its done');
                // res.redirect('/userhome')

            } else {

                console.log('not added to whishlist ');
            }
        }

    } catch (error) {
        console.log(error.message);

        console.log('error from addtowishlist');
        res.render('500')
    }
}
const loadwhishlist = async (req, res) => {

    try {
        const Id = await req.session.user_id
        console.log(Id);
        const user = true
        const userData = await User.findOne({ _id: Id }).populate('whishlist.product').exec()

        console.log(userData);


        res.render('whishlist', { userData,user })

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}
const deletewhishlist = async (req, res) => {

    try {
        console.log('from deletewhishlist');
        const id = req.session.user_id
        const deleteProId = req.body.productId
        console.log(deleteProId);
        const deleteWishlist = await User.findByIdAndUpdate({ _id: id }, { $pull: { whishlist: { product: deleteProId } } })

        if (deleteWishlist) {

            res.json({ success: true })
        }
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


const loadCheckout = async (req, res) => {

    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId }).populate('cart.productId').exec()
        console.log(userData);
        const user= true
        const address = await Address.findOne({ userId: userId })

        res.render('checkout', { userData, address,user })
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}
const addAddressCheckout = async (req, res) => {

    try {

        if (req.session.user_id) {

            const userId = req.session.user_id

            let AddressObj = {

                fullname: req.body.fullname,
                mobileNumber: req.body.number,
                pincode: req.body.zip,
                houseAddress: req.body.houseAddress,

                landMark: req.body.landmark,
                cityName: req.body.city,
                state: req.body.state
            }

            const userAddress = await Address.findOne({ userId: userId })

            if (userAddress) {

                const userAdrs = await Address.findOne({ userId: userId }).populate('userId').exec()
                userAdrs.userAddresses.push(AddressObj)

                await userAdrs.save().then((reps) => {
                    res.redirect('/checkout')
                }).catch((err) => {
                    console.log(err);
                })
                console.log(userAdrs + "save aayi");
            } else {
                let userAddressObj = {

                    userId: userId,
                    userAddresses: [AddressObj]
                }
                await Address.create(userAddressObj).then((res) => {
                    res.redirect('/checkout')
                })
            }

        }

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const placeorder = async (req, res) => {

    try {
       
        const index = req.body.address
       
        const userId = req.session.user_id
        
        const discount = req.body.couponDiscount
        const totel = req.body.total1
        const coupon = req.body.couponC

        const coupopnUpdate= await Coupon.updateOne({couponCode:coupon},{$push:{user:userId}})
        const address = await Address.findOne({ userId: userId })
        
        const userAddress = address.userAddresses[index]
       

        const cartData = await User.findOne({ _id: userId }).populate('cart.productId')
        console.log(cartData);

        const total = cartData.cartTotalPrice
        console.log(total);

        const payment = req.body.payment
        console.log(payment);
        let status = payment === ' COD' ? 'placed':'pending';
        let orderObj = {
            userId: userId,
            address: {

                fullName: userAddress.fullname,
                mobileNumber: userAddress.mobileNumber,
                pincode: userAddress.pincode,
                houseAddress: userAddress.houseAddress,
                streetAddress: userAddress.streetAddress,
                landMark: userAddress.landmark,
                cityName: userAddress.cityName,
                state: userAddress.state

            },
            paymentMethod: payment,
            orderStatus: status,
            items: cartData.cart,
            totalAmount: total,
            discount:discount
        }
        console.log(orderObj);
        await Order.create(orderObj)
            .then(async (data) => {
                const orderId = data._id.toString()
                if (payment == 'COD') {
                    const userData = await User.findOne({_id:userId})
                    const cartData = userData.cart
                    for( let i=0; i< cartData.length;i++){
                        const productStock = await Product.findById(cartData[i].productId);
                        productStock.quantity -= cartData[i].qty;
                        await productStock.save();
                    }
                    await User.updateOne({ _id: userId }, { $set: { cart: [], cartTotalPrice: 0 } })
                    res.json({ status: true })

                }else if (payment == 'WALLET') {

                    const userData = await User.findOne({_id:userId})
                    if (userData.wallet >= total) {
                        const cartData = userData.cart
                        for(let i = 0; i<cartData.length; i++){
                            const productStock = await Product.findById(cartData[i].productId)
                            productStock.quantity -= cartData[i].qty
                            await productStock.save()
                        }
                        const walletBalence = userData.wallet - userData.cartTotalPrice;
                        await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0, wallet:walletBalence}})
                        await Order.updateOne({_id:orderId},{$set:{paymentMethod:'Wallet',orderStatus:'placed'}})
                    
                        const wallet = User.wallet;
                        res.json({ status: true });
                    } else {
                      res.json({ walletBalance: true });
                    }
                    
                }else{
                    var instance = new Razorpay({
                        key_id: process.env.KEY_ID,
                        key_secret: process.env.KEY_SECRET,
                    })
                    let amount  = total
                    instance.orders.create({
                        amount:amount*100,
                        currency:"INR",
                        receipt:orderId,
                    },(err,order) => {
                        console.log(order,"log from placeorder ");
                        res.json({status:false,order})
                    })
                }
            })
           

    } catch (error) {
        console.log(error.message);
        console.log('error found at place order');
        res.render('500')
    }
}

const ordersuccess = async (req, res) => {
    try {

        const userId = req.session.user_id

        const userData = await User.findOne({ _id: userId })
        const orderData = await Order.findOne({ userId: userId }).populate({ path: 'items', populate: { path: 'productId', model: 'Product' } }).sort({ createdAt: -1 }).limit(1)
        const user = true
        res.render('orderconfirmation', { orderData,user })

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}
const orderlist = async (req, res) => {

    try {

        const userId = req.session.user_id

        const orderData = await Order.find({ userId: userId }).populate({ path: 'items', populate: { path: 'productId', model: 'Product' } }).sort({Date:-1})
        const user= true
        res.render('orderlist', { orderData,user })
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const OrderCancel = async (req, res) => {

    try {

        const orderId = req.query.id

        const order = await Order.findById(orderId)

        order.orderStatus = 'cancelled'
        order.save()
        res.redirect('/orderlist')
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const productlist = async (req, res) => {

    try {
        
        const products= await Product.find()
        const user= true
        res.render('productlist',{products,user})

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

// coupon apply 
const couponApply = async(req, res)=>{

    try {
       

        const user= await User.findOne({_id:req.session.user_id})
        console.log(user);

        let cartTotal = user.cartTotalPrice
        console.log("here is the  Carttotal=="+cartTotal);

        // inserting userid into coupon 
      
        const exist = await Coupon.findOne({

            couponCode:req.body.code,
            used:{$in:[user._id]}
        })
        
        console.log(exist);
        if (exist) {
            
            res.json({user:true})
        }else{
      console.log(req.body.couponcode);
            const couponData = await Coupon.findOne({ couponCode: req.body.code})
            console.log(couponData+"coupondata in else casae");
            if (couponData) {
                if (couponData.expiryDate>= new Date()) {
                    if (couponData.limit !==0) {
                        if (couponData.minCartAmount<= cartTotal) {
                            if (couponData.couponAmountType==="fixed") {
                                let discountValue = couponData.couponAmount
                                let value = Math.round(cartTotal- couponData.couponAmount)
                                return res.json({
                                    amountokey:true,
                                    value,
                                    discountValue,
                                    code:req.body.code
                                })
                            }else if( couponData.couponAmountType ==="percentage"){

                                const discountPercentage =
                                
                                (cartTotal* couponData.couponAmount)/100
                                if (discountPercentage <= couponData.minRedeemAmount) {
                                    let discountValue = discountPercentage
                                    let value = Math.round(cartTotal - discountPercentage)
                                    console.log(discountPercentage);
                                    return res.json({
                                        amountokey:true,
                                        value,
                                        discountValue,
                                        code:req.body.code,
                                    })
                                }else{

                                    let discountValue = couponData.minRedeemAmount
                                    let value = Math.round(cartTotal- couponData.minRedeemAmount)
                                    return res.json({
                                        amountokey:true,
                                        value,
                                        discountValue,
                                        code:req.body.code,
                                    })
                                }
                            }
                        }else{

                            res.json({minimum:true})
                        }
                    }else{
                        res.json({ limit:true})
                    }
                }else{
                    res.json({datefailed:true})
                }
            }else{
                res.json({invalid:true})
            }
        }
        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const verifyPayment = async(req,res)=>{
    try{
        console.log("inside verifypayment ");
        console.log(req.body);
        const userId = req.session.user_id
            const details = req.body
            console.log(details.payment); 
            let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET);
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
            hmac = hmac.digest('hex')
    
            const orderId = details.order.receipt
            console.log(orderId);
            if (hmac == details.payment.razorpay_signature) {
    
                console.log('order Successfull')
                await User.updateOne({_id:userId},{$set:{cart:[],cartTotalPrice:0}})
                await Order.findByIdAndUpdate(orderId, { $set: { orderStatus: 'placed' } }).then((data) => {
                    res.json({ status: true, data })
                }).catch((err) => {
                    console.log(err);
                    res.data({ status: false, err })
                })
    
            } else {
                res.json({ status: false })
                console.log('payment failed');
            }

    }catch(error){
        console.log(error.message);
        res.render('500')
    }
}

const whishlistTocart = async (req, res) => {

    try {
        
        const productId = req.body.productId
       
        const _id =  req.session.user_id
      
        let exist = await User.findOne({ id:_id, 'cart.productId': productId })

        if (exist) {
            console.log(exist,"hi we got exist here");
            const user = await User.findOne({ _id: req.session.user_id })
            const index = await user.cart.findIndex(data => data.productId._id == req.body.productId)
            user.cart[index].qty += 1
            user.cart[index].productTotalprice = user.cart[index].qty * user.cart[index].Price
            await user.save()
            res.send(true)
            console.log(user);
        } else {
            const product = await Product.findOne({ _id: req.body.productId })
            console.log("knhdsdho" + product.price);

            const userData = await User.findOne({ _id })

            const result = await User.updateOne({ _id }, { $push: { cart: { productId: product._id, qty: 1, price: product.price, productTotalprice: product.price } } })
           
            if (result) {
                console.log('hi');
              await User.findByIdAndUpdate({ _id:_id}, { $pull: { whishlist: { product: product} } })
                console.log('hi');

                res.json({ status: true })
              

            } else {

                console.log('adding to cart is failed it didnt updated');

            }
        }
    } catch (error) {
        console.log(error.message);
        console.log('error from addto whislist');
        res.render('500')
    }

}


const returnOrder = async(req, res)=>{

    try {
     const orderId = req.query.id
     console.log(orderId);
     const order = await Order.findById(orderId)

     order.orderStatus = 'return requested'
     order.save()

     res.redirect('/orderlist')

        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}

const search_product = async (req, res) => {
    try {
     
      let user;
      if (req.session.user) {
        user = true;
      } else {
        user = true;
      }
      const input = req.body.s;
      const products = await Product.find({ productname: { $regex: input, $options: 'i' } }).populate('category');
      const coupon = await Coupon.find({ active: true });
      const category = await Category.find();
      res.render('productlist', { category, products, user, name: 'search', coupon });
    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  }


  const shopcategory = async(req, res)=>{

    try {

        const Id = req.query.id
       const user= true
        console.log(Id,"here i got");
        res.render('shopfullsleeve',{user})
        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
  }

  const singelorderdowload = async ( req, res)=>{

    try {

        Id = req.query.id
        console.log(Id);
       const orderData = await Order.findById({_id:Id}).populate({ path: 'items', populate: { path: 'productId', model: 'Product' } })
       console.log(orderData);
       const user= false
        res.render('invoicepage',{orderData,user})
        
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
  }
// exporting usercontroller module   
module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifylogin,
    homepage,
    loadhome,
    verifymail,
    userLogout,
    forgetload,
    forgetVerify,
    forgetpasswordload,
    resetPassword,
    verifyPhone,
    verifyOtp,
    otpPage,
    productdetail,
    userProfile,
    addingAddress,
    showaddress,
    AddTowishlist,
    loadwhishlist,
    deletewhishlist,
    editAddress,
    editandupdateaddress,
    DeleteAddress,
    loadCheckout,
    addAddressCheckout,
    placeorder,
    ordersuccess,
    orderlist,
    OrderCancel,
    productlist,
    couponApply,
    verifyPayment,
    whishlistTocart,
    returnOrder,
    search_product,
    shopcategory,
    singelorderdowload
}
