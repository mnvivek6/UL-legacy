// setting rout

const User =require('../models/usersmodel')
const bcrypt = require('bcrypt');

const nodemailer=require('nodemailer');
const config = require('../config/config')
const { response } = require('../routes/userRoute');
const randomstring= require('randomstring');
const { use } = require('bcrypt/promises');

// bcrypt the password for security
// console.log("khgfkgdkhgc");
const Securepassword = async(password)=>{
    console.log("come pass");
    try {

       const passwordHash = await bcrypt.hash(password,10)
       return passwordHash;

    }catch(error){
        // console.log("password");
        console.log(error.message);
    }

}
// for send verification mail
const sendVeryfymail = async(name,email,user_id)=>{

    try {
      const transporter=  nodemailer.createTransport({

            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        })
        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:'for verification mail',
            html:'<p>hii'+name+',please click here to <a href="http://localhost:3000/verify?id='+user_id+'" >verify</a>your mail.</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if (error){
               console.log(error);                
            }else{
                console.log('Email has been sent:-',info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

// for reset password send to mail
const sendResetPasswordmail = async(name,email,token)=>{

    try {
      const transporter=  nodemailer.createTransport({

            host:'smtp.gmail.com',
            port:587,
            secure:false,
            tls:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        })
        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:'for reset password',
            html:'<p>hii  '+name+',please click here to <a href="http://localhost:3000/forget password?token='+token+'" > Reset </a>forget your password.</p>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if (error){
               console.log(error);                
            }else{
                console.log('Email has been sent:-',info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

const loadRegister = async(request,response)=>{

    try {
        response.render('signup')
    } catch (error) {
        console.log(error.message);
    }
}
const insertUser = async(request,response)=>{

    try {
        // console.log(request.body.password);
        const spassword =await Securepassword(request.body.password);
        const NEwUser= new User({
            name:request.body.name,
            email:request.body.email,
            mobile:request.body.mobile,
            password:spassword,
            is_admin:0
        })
        console.log(NEwUser);
        const userData = await NEwUser.save()
        if (userData) {
            sendVeryfymail(request.body.name,request.body.email,userData._id)
            response.render('userlogin',{message:"your registration has been successfull"})
        }else{
            response.render('signup',{message:"your registration has been failed"})
        }
    } catch (error) {
        console.log(error.message);
    }

}

// login user method
const loginLoad=async(request,response)=>{

       try {

        response.render('userlogin')
        
       } catch (error) {
        
        console.log(error.message);
       }


}
const verifylogin= async (request,response)=>{

    try {

        const email=request.body.email;
        const password=request.body.password
        // console.log(request.body.password);
       const userData =User.findOne({email:email})
       .then((userData)=>{
        if (userData) {
            
          bcrypt.compare(password,userData.password).then((data)=>{

            const passwordMatch=data
            if (passwordMatch) {
              
                
                if (userData.is_varified==0) {
                    
                    response.render('userlogin',{message:'please verify your mail'})
                  
                }else{
                    request.session.user_id=userData._id
                    response.redirect('userhome')
                }
                
             }else{
                response.render('userlogin',{message:"Email and password is incorrect"})
             }
          })
         
         
         
        }else{
            response.render('userlogin',{message:"Email and password is incorrect"})
        }
       })
        


    } catch (error) {
        console.log(error.message);
    }
}

const loadhome = async(request,response)=>{


    try {
        response.render('userhome')
    } catch (error) {
        console.log(error.message);
    }
}

const verifymail= async(request,response)=>{

    try {
      const updateinfo= await  User.updateOne({_id:request.query.id},{$set:{ is_varified:1}})

     console.log(updateinfo); 
     response.render("email")

    } catch (error) {
        console.log(error.message);
        
    }
}


const userlogout = async (request,response)=>{
    try {
        request.session.destroy()
        response.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}
// foget password
const forgetload= async(request,response)=>{
    console.log("hay");
    try {

        response.render('forget')
        
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async(request,response)=>{

    try {
        
     const email=request.body.email
    const userData= await User.findOne({email:email})
if(userData){
console.log(userData);
if (userData.is_varified===0) {
    response.render('forget',{message:"please verify your mail"})
}else{
    const randomString =  randomstring.generate();
    console.log(randomString);
    const updateData = await User.updateOne({email:email},{$set:{token:randomString}})
    console.log(updateData);
    sendResetPasswordmail(userData.name,userData.email,randomString)
    response.render('forget',{message:"Please check your mail to reset your password"})
    
}


}else{
    response.render('forget',{message:"user email is incorrect"})
}
    } catch (error) {
        console.log(error.message);
    }
}
// forget password 
const forgetpasswordload=async(request,response)=>{

    try {
        const  token = request.query.token
       const tokenData= User.findOne({token:token})
       if (condition) {
        response.render('forget',{user_id:tokenData._id})
        
       }else{
        response.render('404',{message:"token is invalid"})
       }
    } catch (error) {
        console.log(error.message);
    }
}

// reset password
const resetPassword=async(request,response)=>{

    try {
        
        const password = request.body.password
        const user_id=request.body.user_id

        const secure_password = await Securepassword(password)
        const updateData= await  User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        response.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}
// verification send mail link

// const verificationload = async(request,response)=>{

//     try {

//         response.render('/verification')
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// verification link 

// const sentverificationlink= async(request,response)=>{
//     try {
//         const email=request.body.email
//         const userData= await User.findOne({ email:email})
//         if (userData) {
            
//               sendVeryfymail(userData.name,userData.email,userData._id)
//               response.render('/verification',{message:"Reset verification mail sent your mail id,please check"})

//         }else{
//          response.render('/verification',{message:"not exist"})
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// exporting usercontroller module   
module.exports={
    loadRegister,
    insertUser,
    loginLoad,
    verifylogin,
    loadhome,
    verifymail,
    userlogout,
    forgetload,
    forgetVerify,
    forgetpasswordload,
    resetPassword,
    // verificationload,
    // sentverificationlink
    
}
