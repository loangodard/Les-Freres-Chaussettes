const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    title:String,
    bande1:String,
    numero:String,
    pseudo:String,
    bande2:String,
    bande3:String,
    bande4:String,
    numberColor:String,
    pseudoColor:String,
    logo:String,
    taille:String,
    quantité:Number
});

module.exports = mongoose.model('CustomJersey', productSchema)