module.exports = (req,res,next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/login')
    }else{
        if(req.session.user.grade !== 'admin'){
            return res.redirect('/')
        }
    }
    next()
}