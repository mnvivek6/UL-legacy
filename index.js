const mongoose = require("mongoose")
// connecting to mongodb

mongoose.set('strictQuery', true)
mongoose.connect("mongodb://127.0.0.1:27017/legacy");
// ------------------------------------------------
const path = require('path')

const express = require("express")
const app = express();

app.use(express.static(path.join(__dirname, 'public')))

// setting view engine
app.set('view engine', 'ejs')
app.set('views', './views/users')

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

app.set('view engine', 'ejs')
// app.set('views','./views/admin')

const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

app.listen(3000, function () {
    console.log('server is run..');
})