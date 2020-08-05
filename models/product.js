const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  imagesUrl:{
    type: Array,
    required: true
  },
  size:{
    type: Array,
    required: true
  },
  active:{
    type:Boolean,
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema)