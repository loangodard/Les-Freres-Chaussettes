const Product = require('../models/product');
const Order = require('../models/order')
const sgMail = require('@sendgrid/mail');
const getActualDate = require('../util/getActualDate')
const getHtmlMail = require('../util/getHtmlMail')



exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isLoggedIn: req.session.isLoggedIn
  });
};



exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  var images = req.files.map(f => {
    return f.path
  })
  images = images.map(path => path.replace('public', ''))
  console.log(images)
  const description = req.body.description
  const price = Number(req.body.price)
  const sizes = [req.body.size1, req.body.size2, req.body.size3]
  const finalSizes = []
  for (size of sizes) {
    if (size != "") {
      finalSizes.push(size)
    }
  }
  const active = Boolean(req.body.active)
  console.log(active)
  const product = new Product(
    {
      title: title,
      price: price,
      description: description,
      imagesUrl: images,
      size: finalSizes,
      active: active
    }
  );
  product
    .save()
    .then(result => {
      console.log('Created product!');
      res.redirect('/admin/add-product')
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    res.redirect('/')
  }
  const prodId = req.params.productId

  Product.findById(prodId).then(product => {
    if (!product) {
      return res.redirect('/')
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product,
      isLoggedIn: req.session.isLoggedIn
    });
  })

};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const title = req.body.title
  const description = req.body.description
  const price = Number(req.body.price)
  const sizes = [req.body.size1, req.body.size2, req.body.size3]
  const finalSizes = []

  var active = Boolean(req.body.active)
  if (!active) {
    active = false
  }

  for (size of sizes) {
    if (size != "") {
      finalSizes.push(size)
    }
  }
  Product.findById(prodId).then(product => {
    product.title = title
    product.price = price
    product.size = finalSizes
    product.description = description
    product.active = active
    return product.save()
  })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err)
    })
}

exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Les Frères Chaussettes',
      path: '/admin/products',
      isLoggedIn: req.session.isLoggedIn
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  Product.findOneAndDelete(prodId)
    .then(() => {
      console.log('DELETING PRODUCT')
      res.redirect('/admin/products')
    })
    .catch(err => console.log(err))

}

exports.getOrders = (req, res, next) => {
  Order.find().sort({ date: -1 }).find({ status: { $ne: 'archivée' } }).then(orders => {
    console.log(orders)
    res.render('admin/orders', {
      path: '/orders',
      pageTitle: 'Commandes',
      orders: orders,
      isLoggedIn: req.session.isLoggedIn
    })
  })
}

exports.postPaiementVerifie = (req, res, next) => {
  const orderId = req.body.orderId
  Order.findById(orderId).then(order => {
    order.paiement = 'vérifié'
    order.save()
  }).then(r => {
    res.redirect('/admin/orders')
  })
}

exports.postCommandeProduite = (req, res, next) => {
  const orderId = req.body.orderId
  Order.findById(orderId).then(order => {
    order.status = 'produite'
    order.save()
  }).then(r => {
    res.redirect('/admin/orders')
  })
}

exports.postCommandeEnvoyee = (req, res, next) => {
  const orderId = req.body.orderId
  const numeroSuivi = req.body.numeroSuivi

  Order.findById(orderId).then(order => {
    order.status = 'envoyée'
    order.numeroSuivi = numeroSuivi

    sgMail.setApiKey('-----');
    const msg = {
      to: order.user.email,
      from: 'LesFreresChaussettes@lesfrereschaussettes.com',
      subject: 'Vos chaussettes sont en routes...',
      text: 'Voici votre numéro de commande : '+numeroSuivi,
      html: getHtmlMail.numeroSuivi(numeroSuivi),
    };
    sgMail.send(msg);

    order.dateEnvoi = getActualDate.getActualDate()

    order.save()
  }).then(r => {
    res.redirect('/admin/orders')
  })
}

exports.postCommandeArchiver = (req, res, next) => {
  const orderId = req.body.orderId
  Order.findById(orderId).then(order => {
    order.status = 'archivée'
    order.save()
  }).then(r => {
    res.redirect('/admin/orders')
  })
}
