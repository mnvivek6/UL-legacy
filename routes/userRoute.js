const express = require("express")
const user_route = express()
const session= require('express-session')

user_route.set('views engine','ejs')
user_route.set('views','./views/users')
const bodyparser = require('body-parser')
user_route.use(bodyparser.json())
user_route.use(bodyparser.urlencoded({extended:true}))
// requiring user controller here

const userController= require("../controllers/userController")
user_route.get('/signup',userController.loadRegister)

user_route.post('/signup',userController.insertUser)

user_route.get('/verify',userController.verifymail)

user_route.get('/',userController.loginLoad)   

user_route.get('/login',userController.loginLoad)

user_route.post('/login',userController.verifylogin)

user_route.get('/home',userController.loadhome)

module.exports= user_route 