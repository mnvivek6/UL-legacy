// setting rout

const User =require('../models/usersmodel')
const bcrypt = require('bcrypt');

const nodemailer=require('nodemailer')

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

const sendVeryfymail = async(name,email,user_id)=>{

    try {
      const transporter=  nodemailer.createTransport({

            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'vivekmn04@gmail.com',
                pass:'nzvfjzdaslzezxln'
            }
        })
        const mailOptions={
            from:'vivekmn04@gmail.com',
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
            response.render('signup',{message:"your registration has been successfull"})
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
        console.log(request.body.password);
       const userData =User.findOne({email:email})
       .then((userData)=>{
        if (userData) {
            console.log(userData);
          bcrypt.compare(password,userData.password).then((data)=>{

            const passwordMatch=data
            if (passwordMatch) {
                
                if (userData.is_varified===0) {
                    
                    response.render('userlogin',{message:'please verify your mail'})
                  
                }else{
                    response.redirect('/userhome')
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

// exporting usercontroller module   
module.exports={
    loadRegister,
    insertUser,
    loginLoad,
    verifylogin,
    loadhome,
    verifymail
}
