const User = require("../models/user")
const Cart = require("../models/cart")

const bcrypt = require('bcryptjs');


exports.getLogin = (req, res, next) => {
    bcrypt.hash('Lfc@dmin031', 12).then(r => console.log(r))
    res.render('auth/login', {
        pageTitle: 'Connexion',
        isAuthenticated: false,
        isLoggedIn:req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const pwd = req.body.password

    User.findOne({ email: email }).then(user => {
        console.log(user)
        bcrypt.compare(pwd, user.password).then(doMatch => {
            if (doMatch) {
                console.log('success')
                req.session.user = user
                req.session.isLoggedIn = true
                res.redirect('/')
            } else {
                console.log('fail')
                res.redirect('/login')
            }
        })
    })

}