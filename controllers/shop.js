const User = require('../models/user')
const Product = require('../models/product');
const CustomJersey = require('../models/customJersey')
const Order = require('../models/order')
const Cart = require('../models/cart')
const CustomCart = require('../models/customCart')
const converter = require('../util/convert');
const getActualDate = require('../util/getActualDate')
const order = require('../models/order');
const { findById } = require('../models/user');
const product = require('../models/product');
const stripe = require('stripe')(process.env.STRIPE_KEY)
const calculateShipping = require('../util/calculateShipping')
const sgMail = require('@sendgrid/mail');
const getHtmlMail = require('../util/getHtmlMail')


exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/products', {
      prods: products,
      pageTitle: 'Les Frères Chaussettes',
      path: '/',
      isLoggedIn: req.session.isLoggedIn
    });
  });
};

exports.getProductDetail = (req, res, next) => {
  const prodId = req.params.productId //GET dans l'url
  Product.findById(prodId).then(product => {
    res.render('shop/product-detail', {
      prod: product,
      pageTitle: product.title,
      path: 'shop/product-detail',
      isLoggedIn: req.session.isLoggedIn
    })
  })
}

exports.logSession = (req, res, next) => {
  next()
}

exports.getIndex = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Les Frères Chaussettes',
      path: '/',
      isLoggedIn: req.session.isLoggedIn
    });
  });
};

exports.postDeleteCartProduct = (req, res, next) => {
  const productId = req.body.prodId
  const sizeToDelete = req.body.sizeToDelete
  const cart = new Cart(req.session.cart)
  cart.delete(productId, sizeToDelete)
  req.session.cart = cart
  const customCart = new CustomCart(req.session.customCart ? req.session.customCart : {})
  req.session.customCart = customCart
  res.redirect('/cart')

}

exports.postDeleteCartCustomProduct = (req, res, next) => {
  const indexToDelete = Number(req.body.indexToDelete)
  const price = Number(req.body.price)
  const qty = Number(req.body.qty)
  const customCart = new CustomCart(req.session.customCart)
  customCart.delete(indexToDelete, price, qty).then(r => {
    return req.session.customCart = customCart
  }).then(r => {
    res.redirect('/cart')
  })
}

exports.getCart = (req, res, next) => {
  var cart = new Cart(req.session.cart ? req.session.cart : {})
  const customCart = new CustomCart(req.session.customCart ? req.session.customCart : {});

  cart.updatePrice().then(result => {
    req.session.cart = cart
    req.session.customCart = customCart
    const shippingCost = calculateShipping.calculateShipping(cart.totalQty + customCart.totalQty)
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Mon panier',
      products: cart.items,
      customProducts: customCart.items,
      totalPrice: cart.totalPrice + customCart.totalPrice,
      shippingPrice: shippingCost,
      isLoggedIn: req.session.isLoggedIn
    })
  })


}

exports.postCart = (req, res, next) => {
  const id = req.body.productId
  const size = req.body.size
  const cart = new Cart(req.session.cart ? req.session.cart : { items: [{ itemId: 0, size: 0, price: 0, qty: 0 }] })
  Product.findById(id)
    .then(product => {
      cart.add(product, id, size)
      req.session.cart = cart
      return cart
    })
    .then(result => {
      res.redirect('/product-detail/' + id)
    })
}

exports.postSaveCart = (req, res, next) => {
  var cart = new Cart(req.session.cart)
  const itemId = req.body.productId
  const newQuantity = req.body.newQuantity
  const productIndex = req.body.productIndex

  cart.updateTheQty(itemId, newQuantity, productIndex).then(result => {
    cart.updatePrice().then(result => {
      req.session.cart = cart
      res.redirect('/cart')
    })
  })
}

exports.getCheckout = (req, res, next) => {
  let products = req.session.order.products.concat(req.session.order.customProducts)
  let total = 0
  products.forEach(p => {
    total += Number(p.price)
  })

  const prods = products.map(p => {
    if (p.item.title === "Customized Jersey") {
      return {
        name: p.item.title + ' x' + p.qty,
        description: 'LFC CUSTOM, Pseudo: ' + p.item.pseudo + ' & Numéro: ' + p.item.numero,
        amount: Number((p.price * 100).toFixed(0)),
        currency: 'eur',
        quantity: 1
      }
    } else {
      return {
        name: p.item.title,
        description: p.item.description,
        amount: Number((p.item.price * 100).toFixed(0)),
        currency: 'eur',
        quantity: p.qty
      }
    }
  })

  prods.push({
    name: "Frais d'envoi",
    amount: Number((calculateShipping.calculateShipping(req.session.cart.totalQty + req.session.customCart.totalQty) * 100).toFixed(2)),
    currency: 'eur',
    quantity: 1
  })

  const params = {
    address: {
      city: req.session.order.user.adresseLivraison.ville,
      postal_code: req.session.order.user.adresseLivraison.cp,
      line1: req.session.order.user.adresseLivraison.adresse
    },
    email: req.session.order.user.email,
    name: req.session.order.user.nom + ' ' + req.session.user.prenom,
    phone: req.session.order.user.tel
  }

  const session = stripe.customers.create(params).then(customer => {
    stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: prods,
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    }).then(session => {
      res.render('shop/checkout', {
        path: '/commander',
        pageTitle: 'Commander',
        order: order,
        products: prods,
        sessionId: session.id,
        isLoggedIn: req.session.isLoggedIn
      })
    })
  })
}

exports.getCheckoutSuccess = (req, res, next) => {
  if (!req.session.order) {
    res.redirect('/')
  } else {
    const user = req.session.order.user
    const totalPrice = req.session.order.totalPrice
    const products = req.session.order.products
    const customProducts = req.session.order.customProducts

    const dateTime = getActualDate.getActualDate()

    Order.findById(req.session.order._id).then(order => {
      order.date = dateTime
      order.user = user
      order.status = 'commande reçu'
      order.paiement = 'paiement à vérifier'
      order.totalPrice = totalPrice
      order.products = products
      order.customProducts = customProducts
      order.save()
      req.session.order = order
    }).then(r => {
      const order = req.session.order
      req.session.destroy()


      sgMail.setApiKey('------');
      const msg = {
        to: order.user.email,
        from: 'LesFreresChaussettes@lesfrereschaussettes.com',
        subject: 'Commande n°'+order._id,
        text: 'Commande n°'+order._id,
        html: getHtmlMail.confirmationCommande(order._id),
      };
      sgMail.send(msg);



      res.render('shop/checkoutSuccess', {
        pageTitle: 'Commande',
        products: order.products,
        customProducts: order.customProducts,
        order: order,
        isLoggedIn: false
      })
    })
  }
}

exports.getCheckoutCancel = (req,res,next) =>{
  res.render('shop/checkoutCancel',{
    pageTitle:'échec du paiement',
    isLoggedIn:req.session.isLoggedIn
  })
}

exports.postOrder = (req, res, next) => {
  const products = req.session.cart.items
  const customProducts = req.session.customCart.items
  const shippingCost = calculateShipping.calculateShipping(req.session.cart.totalQty + req.session.customCart.totalQty)
  if (!req.session.order) {
    const order = new Order({
      user: {
        nom: '-',
        prenom: '-',
        email: '-',
        tel: '-',
        adresseLivraison: {
          ville: '',
          adresse: '',
          cp: ''
        }
      },
      totalPrice: Number(req.session.cart.totalPrice) + Number(req.session.customCart.totalPrice),
      products: products,
      shippingPrice: shippingCost,
      customProducts: customProducts,
      status: 'commande en cours',
      paiement: 'en cours'
    })
    req.session.order = order
    order.save().then(r => {
      res.redirect('/commander')
    })
  } else {
    Order.findByIdAndUpdate(req.session.order._id, {
      shippingPrice: shippingCost,
      totalPrice: Number(req.session.cart.totalPrice) + Number(req.session.customCart.totalPrice),
      products: products,
      customProducts: customProducts
    }, (err, r) => {
      req.session.order = r
    }
    ).then(r => {
      res.redirect('/commander')
    })
  }
}

exports.getCommander = (req, res, next) => {
  const cart = req.session.cart
  const order = req.session.order
  //Pb est que quand je reset l'order, je ne remet pas products
  let products = req.session.order.products.concat(req.session.order.customProducts)
  let total = 0
  products.forEach(p => {
    total += Number(p.price)
  })

  const prods = products.map(p => {
    if (p.item.title === "Customized Jersey") {
      return {
        name: p.item.title + ' x' + p.qty,
        description: 'LFC CUSTOM, Pseudo: ' + p.item.pseudo + ' & Numéro: ' + p.item.numero,
        amount: Number((p.price * 100).toFixed(0)),
        currency: 'eur',
        quantity: 1
      }
    } else {
      return {
        name: p.item.title,
        description: p.item.description,
        amount: Number((p.item.price * 100).toFixed(0)),
        currency: 'eur',
        quantity: p.qty
      }
    }
  })

  res.render('shop/commander', {
    path: '/commander',
    pageTitle: 'Commander',
    order: order,
    products: prods,
    isLoggedIn: req.session.isLoggedIn
  })
}

exports.postPaiement = (req, res, next) => {
  const nom = req.body.nom
  const prenom = req.body.prenom
  const mail = req.body.email
  const tel = req.body.tel
  const adresse = req.body.adresse
  const cp = req.body.cp
  const ville = req.body.ville
  req.session.user = new User({
    nom: nom,
    prenom: prenom,
    email: mail,
    password: req.session.user.password,
    grade: req.session.user.grade
  })
  req.session.order.user = {
    nom: nom,
    prenom: prenom,
    email: mail,
    tel: tel,
    adresseLivraison: {
      adresse: adresse,
      cp: cp,
      ville: ville
    }
  }
  res.redirect('/checkout')
}

exports.getCustomJersey = (req, res, next) => {
  res.render('shop/jerseyCustom', {
    path: '/jerseyCustom',
    pageTitle: 'LFC Customize',
    modifying: false,
    isLoggedIn: req.session.isLoggedIn
  })
}

exports.getModifyCustomJersey = (req, res, next) => {
  const id = req.params.id
  CustomJersey.findById(id).then(r => {
    res.render('shop/jerseyCustom', {
      customJersey: r,
      pageTitle: 'LFC Customize',
      modifying: true,
      isLoggedIn: req.session.isLoggedIn
    })
  })
}

exports.postCustomJersey = (req, res, next) => {
  const customJersey = new CustomJersey({
    title: 'Customized Jersey',
    bande1: req.body.bande1,
    numero: req.body.numero,
    pseudo: req.body.pseudo,
    bande2: req.body.bande2,
    bande3: req.body.bande3,
    bande4: req.body.bande4,
    numberColor: req.body.numberColor,
    pseudoColor: req.body.pseudoColor,
    logo: req.body.logo,
    taille: req.body.taille
  })

  customJersey.save().then(result => {
    res.redirect('custom-preview/' + result._id)
  })
}

exports.getCustomJerseyPreview = (req, res, next) => {
  const id = req.params.customJerseyId
  CustomJersey.findById(id).then(r => {
    res.render('shop/customPreview', {
      path: '/custom-preview',
      pageTitle: 'Visualisation',
      customJersey: r,
      isLoggedIn: req.session.isLoggedIn
    })
  })
}

exports.postAddToCustomCart = (req, res, next) => {
  const newCustomCart = new CustomCart(req.session.customCart ? req.session.customCart : {})
  const qtyPrice = req.body.qty
  const qty = Number(qtyPrice.split('-')[0])
  const price = Number(qtyPrice.split('-')[1])

  CustomJersey.findById(req.body.id).then(r => {
    newCustomCart.add(r, qty, price)
    req.session.customCart = newCustomCart
  }).then(r => {
    res.redirect('/cart')
  })
}

exports.postSaveJersey = (req, res, next) => {
  const id = req.body.id

  const bande1 = req.body.bande1
  const bande2 = req.body.bande2
  const bande3 = req.body.bande3
  const bande4 = req.body.bande4
  const pseudo = req.body.pseudo
  const numero = req.body.numero
  const numberColor = req.body.numberColor
  const pseudoColor = req.body.pseudoColor
  const logo = req.body.logo
  const taille = req.body.taille

  CustomJersey.findById(id).then(product => {
    product.bande1 = bande1
    product.bande2 = bande2
    product.bande3 = bande3
    product.bande4 = bande4
    product.pseudo = pseudo
    product.numero = numero
    product.numberColor = numberColor
    product.logo = logo
    product.pseudoColor = pseudoColor
    product.taille = taille

    return product.save()
  }).then(r => {
    console.log('Produit Modifié !')
    res.redirect('/custom-preview/' + id)
  })
}

exports.getCGV = (req, res, next) => {
  res.render('shop/cgv', {
    pageTitle: 'CGV',
    isLoggedIn: req.session.isLoggedIn
  })
}