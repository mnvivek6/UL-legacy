const islogin = async(request,response,next)=>{
    try {

        if (request.session.user_id) {
            
        }else{
            response.redirect('/admin')
        }
        next()
        
    } catch (error) {
        console.log(error.message);
    }
}

const islogout = async(request,response,next)=>{

    try {
        if (request.session.user_id) {
            response.redirect('/admin/home')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    islogin,
    islogout
}