const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    date:{type:String},
    products: [{
        item: { type: Object, required: true },
        qty: { type: Number, required: true },
        size: { type: String, required: true },
        price : {type: Number,required:true}
    }],
    customProducts: [{
        item: { type: Object, required: true },
        qty: { type: Number, required: true },
        price : {type: Number,required:true}
    }],
    totalPrice:{
        type:Number,
        required:true
    },
    shippingPrice:{
        type:Number
    },
    user: {
        nom: {
            type: String,
            required: true
        },
        prenom: {
            type: String,
            required: true
        },
        email: {
            type:String,
            required:true
        },
        tel:{
            type:String,
            required:true
        },
        adresseLivraison:{
            type:Object,
            required:true
        }
    },
    status: { //Reçu, préparation, préparé, envoyé
        type: String,
        required: true
    },
    paiement:{
        type:'String',
        required: true
    },
    numeroSuivi:{
        type:String
    },
    dateEnvoi:{
        type:String
    }
})

module.exports = mongoose.model('Order', orderSchema);