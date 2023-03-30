// const usersmodel = require('../models/usersmodel');
const { config } = require('nodemon');
const category = require('../models/category');
const Product = require('../models/productmodel');
const user = require('../models/usersmodel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const configg = require('../config/config')
const Coupon = require('../models/couponModel')
const fs = require('fs');
const path = require('path');
const Category = require('../models/category');
const Banner = require('../models/bannerModel')



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
       const couponsData =await Coupon.find({disable:true})
        res.render('add-coupon',{couponsData})
        
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req, res)=>{


    try {
        const couponData = {...req.body}
      

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
    res.redirect('/admin/loadcoupon')
  

    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async( req, res)=>{

    try {
        
        const imgId = req.params.imgid
        console.log(imgId);
        const prodid = req.params.prodid
        fs.unlink(path.join(__dirname,'../public/img',imgId),()=>{})
        const productImg = await Product.updateOne({_id:prodid},{$pull:{image:imgId}})
     
    } catch (error) {
        console.log(error.message);
    }
}

const updateImage = async( req, res)=>{


    try {
        
        const id= req.params.id
        console.log(id);
        const proData= await Product.findOne({_id:id})
        console.log(proData);
        imagelength = proData.image.length
        console.log(imagelength);
        if (imagelength<=4) {
            let images =[]
            for(file of req.files){

                images.push(file.filename)
            }
            if (imagelength+images.length<=4) {

                const updateData = await Product.updateOne({_id:id},{$addToSet:{image:{$each:images}}})
                res.redirect('/admin/productupdate/'+id)     
            }else{

                const productData = await Product.findOne({_id:id})

                const categoryData = await Category.find()

                res.render("productupdate",{productData,categoryData})
            }
        }else{

            res.redirect('/admin/productupdate/')
        }


    } catch (error) {
        console.log(error.message);
    }
}


const categoryimgdelete = async (req, res)=>{

   try {
  console.log(' first part here categoryimgdelete');
  const imgId = req.params.image
  console.log(imgId);
    const categoryId= req.params.id
    console.log(categoryId);
    fs.unlink(path.join(__dirname,'../public/img',imgId),()=>{})
    const categoryimg = await Category.updateOne({_id:categoryId},{$unset:{image:imgId}})   
    res.redirect('/admin/edit-category') 
   } catch (error) {
    console.log(error.message);
   }
}
const editcoupon = async(req, res)=>{

    try {
        const couponId= req.params.id
        console.log(couponId);
        const couponData= await Coupon.findOne({_id:couponId})
        console.log(couponData);
        res.render('edit-coupon',{couponData})
        
    } catch (error) {
     console.log(error.message);   
    }
}

const couponUpdate = async(req, res)=>{
    try {

        const couponId = req.params.id
        console.log(couponId+'it works');
        const update = await Coupon.updateOne({_id:couponId},{$set:{

            couponCode:req.body.couponcode,
            couponAmountType:req.body.fixedandpercentage,
            couponAmount:req.body.couponamount,
            minCartAmount:req.body.cartamount,
            minRedeemAmount:req.body.radeemamount,
            startDate:req.body.startdate,
            expiryDate:req.body.expirydate,
            limit:req.body.usagelimit,
            
        }})
        
        console.log(update);
        res.redirect('/admin/loadcoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const deletecoupon= async(req, res)=>{

    try {

        const couponId= req.params.id

        const disabel= await Coupon.updateOne({_id:couponId},{$set:{disable:false}})
        res.redirect("/admin/loadcoupon")
        
    } catch (error) {
        console.log(error.message);
    }
}
const enablecoupon = async( req, res)=>{

    try {

        const couponId = req.params.id
        const enable = await Coupon.updateOne({_id:couponId},{$set:{disable:true}})
        res.redirect("/admin/loadcoupon")
    } catch (error) {
        console.log(error.message);
    }
}
const loadbanner= async(req, res)=>{

    try {
        const banner = await Banner.find()
        res.render('add-banner',{banner})
        
    } catch (error) {
        console.log(error.message);
    }
}

const insertBanner = async(req, res)=>{

    try {

        const filename = req.file.filename

        const bannerData = new Banner({
           
            type:req.body.type,
            discription:req.body.description,
            bannerImage:filename,
        })
        console.log(bannerData);
        const result = await bannerData.save()

        if (result) {
            res.redirect('/admin/loadbanner')
        }else{
            console.log('not inserted');
        }
        
    } catch (error) {
        console.log(error.message);
        console.log('got from insert BAnner');
    }
}
const deletebanner= async(req, res)=>{

    try {

        const bannerId= req.params.id
        await Banner.updateOne({_id:bannerId},{$set:{block:true}})
        res.redirect('/admin/loadbanner')
        
    } catch (error) {
        console.log(error.message);
    }
}
const enblebanner = async(req, res)=>{
     
    try {
console.log('hi');
        const bannerId= req.params.id
        await Banner.updateOne({_id:bannerId},{$set:{block:false}})
        res.redirect('/admin/loadbanner')
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
    addCoupon,
    deleteImage,
    updateImage,
    categoryimgdelete,
    editcoupon,
    couponUpdate,
    deletecoupon,
    loadbanner,
    insertBanner,
    deletebanner,
    enblebanner,
    enablecoupon
    
}