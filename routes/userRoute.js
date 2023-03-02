const express = require("express")
const user_route = express.Router()
const session= require('express-session')
const config= require('../config/config')

user_route.use(session({secret:config.sessionSecret}))

const auth= require('../middleware/auth')

// user_route.set('views engine','ejs')
// user_route.set('views','./views/users')
const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))
// requiring user controller here

const userController= require("../controllers/userController")

user_route.get('/signup',userController.loadRegister)

user_route.post('/signup',userController.insertUser)

user_route.get('/login',userController.loginLoad)  

user_route.get('/userhome',(r,re)=>{
    re.render('userhome')
})

user_route.post('/login',userController.verifylogin)

user_route.get('/',userController.loadhome)

user_route.get('/forget',userController.forgetload)

user_route.post('/forget',userController.forgetVerify)

user_route.get('/forget-password',userController.forgetpasswordload)

user_route.post('/forget-password',userController.resetPassword)

user_route.get('/verify',userController.verifymail)

user_route.get('/login',userController.loginLoad)

// user_route.get('/logout',userController.userlogout)

// user_route.get('/verification',userController.verificationload)

// user_route.post('/verification',userController.sentverificationlink)

module.exports= user_route 