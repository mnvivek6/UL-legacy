
const express = require('express')
const admin_route=express()
const config = require('../config/config')
const session = require("express-session")
admin_route.use(session({secret:config.sessionSecret}))


const bodyparser = require('body-parser')
admin_route.use(bodyparser.json())
admin_route.use(bodyparser.urlencoded({extended:true}))

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const auth  = require('../middleware/adminauthe')

const adminController = require('../controllers/adminController')

admin_route.get('/',auth.islogout,adminController.loadlogin)

admin_route.post('/',adminController.verifylogin)

admin_route.get('/home',auth.islogin,adminController.loadDashboard)

admin_route.get('/logout',auth.islogin,adminController.logout)

admin_route.get('/useredit',adminController.userTable)

admin_route.get('/block-user',adminController.blockUser)

admin_route.get('/unblock-user',adminController.unblockUser)

// admin_route.get('/')

admin_route.get('*',function(request,response){

    response.redirect('/admin')
})


module.exports=admin_route




