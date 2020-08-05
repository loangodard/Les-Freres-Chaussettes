const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();



router.get('/',shopController.logSession ,shopController.getIndex);

router.get('/products',shopController.logSession , shopController.getProducts);

router.get('/product-detail/:productId',shopController.logSession ,shopController.getProductDetail);

router.get('/modify-jersey/:jerseyIndex')

router.get('/cart',shopController.logSession ,shopController.getCart);
router.post('/cart',shopController.logSession ,shopController.postCart)

router.post('/save-cart',shopController.logSession ,shopController.postSaveCart)

router.post('/cart-delete-item',shopController.logSession ,shopController.postDeleteCartProduct)


router.get('/checkout',shopController.logSession ,shopController.getCheckout);

router.post('/create-order',shopController.logSession ,shopController.postOrder)

router.get('/commander',shopController.logSession ,shopController.getCommander)

router.post('/paiement',shopController.logSession ,shopController.postPaiement)

router.get('/custom-jersey',shopController.logSession ,shopController.getCustomJersey)

router.post('/custom-jersey',shopController.logSession ,shopController.postCustomJersey)

router.get('/custom-preview/:customJerseyId',shopController.logSession ,shopController.getCustomJerseyPreview)

router.get('/custom-jersey/:id',shopController.logSession ,shopController.getModifyCustomJersey)

router.post('/add-to-custom-cart',shopController.logSession ,shopController.postAddToCustomCart)

router.post('/cart-delete-custom-item',shopController.logSession ,shopController.postDeleteCartCustomProduct)

router.post('/save-jersey',shopController.logSession ,shopController.postSaveJersey)

router.get('/checkout/success',shopController.logSession ,shopController.getCheckoutSuccess)
router.get('/checkout/cancel',shopController.getCheckoutCancel)

router.get('/cgv',shopController.logSession ,shopController.getCGV)

module.exports = router;
