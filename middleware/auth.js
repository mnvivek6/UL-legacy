
const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {

        } else {
            res.redirect('/')
            return
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/userhome')
            return
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}
