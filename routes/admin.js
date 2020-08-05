const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

const multer = require('multer')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/produits')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({ storage: storage })


// /admin/add-product => GET
router.get('/add-product', isAuth,adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

// /admin/add-product => POST
router.post('/add-product', isAuth, upload.array('images',4), adminController.postAddProduct);

// /admin/edit-product => POST
router.post('/edit-product', isAuth, adminController.postEditProduct)

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.get('/orders', isAuth, adminController.getOrders)

router.post('/paiement-verifie', isAuth, adminController.postPaiementVerifie)
router.post('/commande-produite', isAuth, adminController.postCommandeProduite)
router.post('/commande-envoyee', isAuth, adminController.postCommandeEnvoyee)
router.post('/commande-archiver', isAuth, adminController.postCommandeArchiver)


module.exports = router;
