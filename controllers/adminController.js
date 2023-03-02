// const usersmodel = require('../models/usersmodel');
const user = require ('../models/usersmodel')
const bcrypt = require('bcrypt')
// loginpage render 
const loadlogin = async(request,response)=>{

    try {
        response.render('login')
    } catch (error) {
        console.log(error.message);
    }
}
// verify login 

const verifylogin = async(request,response)=>{
    // response.send('hi')
    try {

     const email = request.body.email
     console.log(request.body.email);
     const password = request.body.password
     const userData=await user.findOne({email:email})
        
     if (userData) {
        console.log(userData);

       const passwordMatch = await bcrypt.compare(password,userData.password)
        if ( passwordMatch) {
            
            if (userData.is_admin===0) {
               
                response.render('login',{message:'naaye'})
            }else{
                request.session.user_id=userData._id
                console.log(request.session.user_id);
                response.render('home')
               
            }
               
            
        }
     }else{
        response.render('login',{message:'email and password is incorrect'})
     }
    } catch (error) {
        console.log(error.message);
    }
}

// loadDashboard

const loadDashboard= async(requset,response)=>{

    try {
      const userData=  await  user.findById({_id:request.session.user_id})
        response.render('home')
    } catch (error) {
        console.log(error.message);
    }
}

// logout

const logout = async(request,response)=>{

    try {
        request.session.destroy()
        response.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const userTable = async(request,response)=>{

    try {
        const userData = await user.find({is_admin:0})
        response.render('useredit',{users:userData})
    } catch (error) {
        console.log(error.message);
    }

    
}

const blockUser = async(request,response)=>{

    try {
        const userId = request.query.id
        console.log(userId);
        const userData= await user.findByIdAndUpdate({_id:userId},{$set:{block:true}})
        if (userData) {
            console.log(userData);
            response.redirect('/admin/useredit')
        }     
    } catch (error) {
        console.log(error);
    }
}
const unblockUser = async (request,response)=>{
    const userId = request.query.id
    console.log(userId);
    const userData = await user.findByIdAndUpdate({_id:userId},{$set:{block:false}})
    if (userData) {
        response.redirect('/admin/useredit')
    }
}

module.exports={
    loadlogin,
    verifylogin,
    loadDashboard,
    logout ,
    userTable,
    unblockUser ,
    blockUser
}