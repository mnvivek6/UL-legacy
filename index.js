const mongoose = require("mongoose")
// connecting to mongodb
mongoose.connect("mongodb://127.0.0.1:27017/legacy");
// ------------------------------------------------
const path = require('path')

const express=require("express")
const app= express();

app.use(express.static(path.join(__dirname,'public')))

const userRoute = require('./routes/userRoute')

// setting view engine
app.set('view engine','ejs')
app.set('views','./views/users')


app.use('/',userRoute)

app.get('/signup',function(request,response){

    response.render('signup')

})

app.listen(3000,function(){
    console.log('server is run..');
})