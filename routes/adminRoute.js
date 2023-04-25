
const express = require('express')
const admin_route = express()
const config = require('../config/config')
const session = require("express-session")
admin_route.use(session({
    secret: 'mysessionsecret',
    resave: false,
    saveUninitialized: false
}));


const bodyparser = require('body-parser')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({ extended: true }))

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')

const auth = require('../middleware/adminauthe');
const product_Controller = require('../controllers/productcontroller');
const category_Controller = require('../controllers/categorycontroller');
const adminController = require('../controllers/adminController')
const multer = require('multer')

const path = require('path')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img'))
    }, filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})

const upload = multer({ storage: storage })

const catestorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/category-img'))
    }, filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})

const cateupload = multer({ storage: catestorage })

const bannerStorage =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,"../public/assets/banner"))
    },
    filename:function(req,file,cb){
        const name = Date.now()+"-"+file.originalname
        cb(null,name)
    }
})

const bannerMult = multer({storage:bannerStorage})


// authentications and log , logout
admin_route.get('/', adminController.loadlogin)
admin_route.post('/', adminController.verifylogin)
admin_route.get('/logout', auth.islogin, adminController.logout)
admin_route.get('/adminprofile',auth.islogin,adminController.adminprofile)


// admin home
admin_route.get('/home', auth.islogin, adminController.loadDashboard)


// user information
admin_route.get('/useredit', auth.islogin, adminController.userTable);
admin_route.get('/block-user',auth.islogin, adminController.blockUser);
admin_route.get('/unblock-user', auth.islogin,adminController.unblockUser);
admin_route.get('/list-user', auth.islogin, adminController.loaduser);


// product management
admin_route.get('/list-product',auth.islogin, product_Controller.list_product);
admin_route.get('/add-product',auth.islogin, product_Controller.add_product);
admin_route.post('/add-product',upload.array('image', 4), product_Controller.addproduct)
admin_route.get('/delete-product-image/:imgid/:prodid',auth.islogin,adminController.deleteImage)
admin_route.post("/edit-image/:id",upload.array('image'), adminController.updateImage)
admin_route.delete('/delete-product',auth.islogin, product_Controller.deleteproduct)
admin_route.get('/productupdate/:id',auth.islogin, product_Controller.productupdate)
admin_route.post('/productupdate', product_Controller.editproduct)
// admin_route.get('/delete-img',product_Controller.deleteImage)



//category management
admin_route.get('/add-category',auth.islogin, category_Controller.formcategory)
admin_route.post('/add-category', cateupload.single('image'), category_Controller.addcategory)
admin_route.get('/delete-category-img/:image/:id',auth.islogin,adminController.categoryimgdelete)
admin_route.get('/category-list', auth.islogin,category_Controller.showcategory)
admin_route.get('/edit-category',auth.islogin, category_Controller.updatecategory)
admin_route.post('/edit-category', category_Controller.editcategory)
admin_route.get('/delete-category',auth.islogin, category_Controller.deletecategory)

//coupon 
admin_route.get('/loadcoupon',auth.islogin,adminController.loadCoupon)
admin_route.post('/addcoupon',adminController.addCoupon)
admin_route.get("/editcoupon/:id",auth.islogin,adminController.editcoupon)
admin_route.post('/updatecoupon/:id',adminController.couponUpdate)
admin_route.get('/deletecoupon/:id',auth.islogin,adminController.deletecoupon)
admin_route.get('/enablecoupon/:id',auth.islogin,adminController.enablecoupon)

// banner
admin_route.get("/loadbanner",auth.islogin,adminController.loadbanner)
admin_route.post('/inserbanner',bannerMult.single('bannerimage'),adminController.insertBanner)
admin_route.get('/disablebanner/:id',auth.islogin,adminController.disablebanner)
admin_route.get('/enablebanner/:id',auth.islogin,adminController.enblebanner)
admin_route.get('/deletebanner/:id',auth.islogin,adminController.deleteBanner)

// ordermanagement
admin_route.get('/ordermanagement',auth.islogin,adminController.ordermanagement)
admin_route.get('/placeOrder/:id',auth.islogin, adminController.placeOrder)
admin_route.get('/shipedorder/:id',auth.islogin, adminController.shipedorder)
admin_route.get('/deliveredOrder/:id',auth.islogin,adminController.deliveredOrder)
admin_route.get('/returnaccept/:id',auth.islogin,adminController.acceptReturn)
admin_route.get('/rejectreturn/:id',auth.islogin,adminController.rejectReturn)

// sales report
admin_route.get('/salesreport',auth.islogin,adminController.salesReport)
admin_route.post('/showsalesreport',auth.islogin,adminController.showSalesReprot)
admin_route.get('/')


// admin_route.get('/')
admin_route.get('*', function (request, response) {
    response.redirect('/admin')
})

module.exports = admin_route




