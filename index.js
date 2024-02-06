const mongoose = require("mongoose")
// connecting to mongodb

mongoose.set('strictQuery', true)
mongoose.connect("mongodb+srv://mvivekmn:1234@cluster0.kb2qbes.mongodb.net/untitledlegacy?retryWrites=true&w=majority").then((data)=>{
    console.log('mongodb connected');
});

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

app.use((req, res)=>{
res.render('404')
})


app.listen(process.env.PORT, function () {
    console.log('server is run..');
})