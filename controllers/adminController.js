// const usersmodel = require('../models/usersmodel');
const { config } = require('nodemon');
const category = require('../models/category');
const Product = require('../models/productmodel');
const user = require('../models/usersmodel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const configg = require('../config/config')
const Coupon = require('../models/couponModel')



// loginpage render 
const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}



// verify login 
const verifylogin = async (req, res) => {
    // res.send('hi')
    try {

        const email = req.body.email;
        console.log(req.body.email);
        const password = req.body.password
        const userData = await user.findOne({ email: email })

        if (userData) {
            console.log(userData);

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.is_admin === 0) {

                    res.render('login', { message: 'not admin' })
                } else {
                    req.session.admin_id = userData._id
                    console.log(req.session.user_id);
                    res.render('home')

                }
            }
        } else {
            res.render('login', { message: 'email and password is incorrect' })
        }
    } catch (error) {
        console.log(error.message);
    }
}


// loadDashboard
const loadDashboard = async (requset, res) => {

    try {
        // const userData=  await  user.findById({_id:req.session.user_id})
        res.render('home')


    } catch (error) {
        console.log(error.message);
    }
}


// logout
const logout = async (req, res) => {

    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}
const userTable = async (req, res) => {
    try {
        const userData = await user.find({ is_admin: 0 })
        res.render('list-user', { users: userData })
    } catch (error) {
        console.log(error.message);
    }
}


// blocking user
const blockUser = async (req, res) => {

    try {
        const userId = req.query.id
        console.log(userId);
        const userData = await user.findByIdAndUpdate({ _id: userId }, { $set: { block: true } })
        if (userData) {
            console.log(userData);
            sendblockmail(userData.name, userData.email)
            res.redirect('/admin/useredit')
        }
    } catch (error) {
        console.log(error);
    }
}

// unblock User
const unblockUser = async (req, res) => {
    const userId = req.query.id
    console.log(userId);
    const userData = await user.findByIdAndUpdate({ _id: userId }, { $set: { block: false } })
    if (userData) {
        sendunblockmail(userData.name, userData.email)
        res.redirect('/admin/useredit')
    }
}


// loaduser
const loaduser = async (req, res) => {
    try {
        const userData = await user.find({ is_admin: 0 })
        res.render('list-user', { users: userData })
    } catch (error) {
        console.log(error.message);
    }
}


// send blocking mail
const sendblockmail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({

            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: configg.emailUser,
                pass: configg.emailPassword
            }
        })
        const mailOptions = {
            from: "vivekmn04@gmail.com",
            to: email,
            subject: 'verify your Email',
            html: '<p>Hey' + name + 'your blocked'
        }
        transporter.sendMail(mailOptions, (error, info) => {


            if (error) {

                console.log(error);

            } else {
                console.log("email has been sent ", info.res);
            }
        })
    } catch (error) {
        console.log(error.message);
    }


}

const sendunblockmail = async (name, email, user_id) => {


    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: configg.emailUser,
                pass: configg.emailPassword
            }
        })
        const mailOptions = {
            from: 'vivekmn04@gamil.com',
            to: email,
            subject: 'verify your  Email',
            html: "<p> Hey  " + name + ', now you can access our website'
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {

                console.log(error);
            }
            else {
                console.log("email has been sent:-", info.res);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

const loadCoupon = async(req , res)=>{


    try {
       const couponsData =await Coupon.find({disable:false})
        res.render('add-coupon',{couponsData})
        
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req, res)=>{



    try {
        const couponData = {...req.body}
       const  couponCode= couponData.coupon_code
       const   couponAmountType= couponData.fixedandpercentage
       const couponAmount= couponData.couponamount
       const minRedeemAmount= couponData.radeemamount
       const minCartAmount= couponData.cartamount
       const startDate=couponData.startdate
       const expiryDate= couponData.expirydate
       const limit= couponData.usagelimit
if (couponCode==''||couponAmountType==''||couponAmount==''||minRedeemAmount==''||minCartAmount==''||startDate==''||expiryDate==''||limit=='') {
    
    res.render('add-coupon',{message:'Please fill the blank field'})
}else{
    const couponAdd = new Coupon({

        couponCode: couponData.coupon_code,
        couponAmountType: couponData.fixedandpercentage,
        couponAmount: couponData.couponamount,
        minRedeemAmount: couponData.radeemamount,
        minCartAmount: couponData.cartamount,
        startDate:couponData.startdate,
        expiryDate: couponData.expirydate,
        limit: couponData.usagelimit,

    })
    console.log(couponAdd);
    const inser = await couponAdd.save()

    res.redirect('/admin/add-coupon')
}
   
       
       

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadlogin,
    verifylogin,
    loadDashboard,
    logout,
    userTable,
    unblockUser,
    blockUser,
    loaduser,
    sendunblockmail,
    sendblockmail,
    loadCoupon,
    addCoupon
}