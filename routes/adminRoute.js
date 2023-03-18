
const express = require('express')
const admin_route=express()
const config = require('../config/config')
const session = require("express-session")
admin_route.use(session({
    secret: 'mysessionsecret',
    resave: false,
    saveUninitialized: false
  }));
  

const bodyparser = require('body-parser')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const auth  = require('../middleware/adminauthe');
const product_Controller = require('../controllers/product_controller');
const category_Controller = require('../controllers/category_controller');
const adminController = require('../controllers/adminController')
const multer = require('multer')

const path = require('path')
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/img'))
    },filename:function (req,file , cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})

const upload = multer({storage:storage})

const catestorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/category-img'))
    },filename:function (req,file , cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})

const cateupload = multer({storage:catestorage})


// authentications and log , logout
admin_route.get('/',adminController.loadlogin)
admin_route.post('/',adminController.verifylogin)
admin_route.get('/logout',auth.islogin,adminController.logout)


// admin home
admin_route.get('/home',auth.islogin,adminController.loadDashboard)


// user information
admin_route.get('/useredit',adminController.userTable);
admin_route.get('/block-user',adminController.blockUser);
admin_route.get('/unblock-user',adminController.unblockUser);
admin_route.get('/list-user',auth.islogin,adminController.loaduser);


// product management
admin_route.get('/list-product',product_Controller.list_product);
admin_route.get('/add-product',product_Controller.add_product);
admin_route.post('/add-product',upload.array('image',4),product_Controller.addproduct)
admin_route.get('/delete-product',product_Controller.deleteproduct)
admin_route.get('/productupdate',product_Controller.productupdate)
admin_route.post('/productupdate',product_Controller.editproduct)
// admin_route.get('/delete-img',product_Controller.deleteImage)



//category management
admin_route.get('/add-category',category_Controller.formcategory)
admin_route.post('/add-category',cateupload.single('image'),category_Controller.addcategory)
admin_route.get('/category-list',category_Controller.showcategory)
admin_route.get('/edit-category',category_Controller.updatecategory)
admin_route.post('/edit-category',category_Controller.editcategory)
admin_route.get('/delete-category',category_Controller.deletecategory)


// admin_route.get('/')
admin_route.get('*',function(request,response){
    response.redirect('/admin')
})

module.exports=admin_route




