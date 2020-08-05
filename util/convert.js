const User = require('../models/user')

exports.convertSessionUserToUser = (userSession) => {
    const user = new User({
        _id: userSession._id,
        nom : userSession.nom,
        prenom: userSession.prenom,
        email: userSession.email,
        password: userSession.password,
        grade: userSession.grade,
        cart: userSession.cart
    })

    return user
}