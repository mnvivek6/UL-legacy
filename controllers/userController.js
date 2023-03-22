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
// const Address = require('../models/addressModel');
const Address = require('../models/addressModel');
const { response } = require('express');
const { default: mongoose } = require('mongoose');

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

                            }else if (userData.is_admin==1) {
                                res.render('userlogin',{message:'Admins Cannot access user side'})
                            
                            } else {
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
                    res.render('userlogin', { message: 'Your Email or Password Is Not Valid' })
                }
            })



    } catch (error) {
        console.log(error.message);
    }
}

const loadhome = async (req, res) => {

    try {
        const category = await Category.find()

        const products = await Product.find()
        const user = true
        // console.log(products);
        console.log("load homepage");
        res.render('userhome', { products, category, user })
    } catch (error) {
        console.log(error.message);
    }
}
const homepage = async (req, res) => {
    try {
        if (req.session.user_id) {
            const category = await Category.find()

            const products = await Product.find()
            const user = false
            // console.log(products);
            console.log("loading userhome");
            res.render('userhome', { products, category, user })
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
        const product = await Product.findOne({ _id: proid })
        console.log(product);
        res.render('productdetails', { product })
    } catch (error) {
        console.log(error.message);
    }
}

const userProfile = async (req, res) => {

    try {

        const userId = await req.session.user_id
        const userData = await User.findOne({ _id: req.session.user_id })

        res.render('userprofile', { userData })

    } catch (error) {
        console.log(error.message);
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
    }
}

const showaddress = async (req, res) => {

    try {
        // const userData = await User.findOne({_id:req.session.user_id})
        const address = await Address.findOne({ userId: req.session.user_id })


        res.render('address', { address })
    } catch (error) {
        console.log(error.message);
        console.log('error from showaddress');

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
    }

}

const DeleteAddress = async (req , res)=>{

    try {
        
        const adrSchemaId = req.params.id
        const adrsId = req.params.adrsId
        const addressId = mongoose.Types.ObjectId(adrSchemaId)
        const addresses= mongoose.Types.ObjectId(adrsId)

        const addressData = await Address.findOne({addressId})

        const addressIndex = await addressData.userAddresses.findIndex(data=> data.id== addresses)
        addressData.userAddresses.splice(addressIndex,1)

        await addressData.save()

        res.redirect('/userprofile')

    } catch (error) {
       console.log(error.message);       
    }
}

const AddTowishlist = async (req, res) => {

    try {
        console.log('hi');
        const productId = req.body.productId
        // console.log(productId);

        let exist = await User.findOne({ id: req.session.user_id, 'whishlist.product': productId })
        console.log(exist);

        if (exist) {
            res.json({ status: false })
        } else {
            console.log('else gotit');
            const product = await Product.findOne({ _id: req.body.productId })
            console.log("product");
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
    }
}
const loadwhishlist = async (req, res) => {

    try {
        const Id = await req.session.user_id
        console.log(Id);
        const userData = await User.findOne({ _id: Id }).populate('whishlist.product').exec()

        console.log(userData);


        res.render('whishlist', { userData })

    } catch (error) {
        console.log(error.message);
    }
}
const deletewhishlist = async (req, res) => {

    try {

        const id = req.session.user_id
        const deleteProId = req.body.productId
        const deleteWishlist = await User.findByIdAndUpdate({ _id: id }, { $pull: { whishlist: { product: deleteProId } } })

        if (deleteWishlist) {

            res.json({ success: true })
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadCheckout = async( req, res)=>{

    try {
        const userId = req.session.user_id
        const userData = await User.findOne({_Id:userId}).populate('cart.productId').exec()
        const address = await Address.findOne({userId:userId})
        res.render('checkout',{userData,address})
    } catch (error) {
        console.log(error.message);
    }
}

const shipping = async (req, res)=>{

    try {

        res.render('payment')
        
    } catch (error) {
        console.log(error.message);
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
    DeleteAddress ,
    loadCheckout,
    shipping
    
}
