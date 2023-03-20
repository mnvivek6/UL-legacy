const mongoose = require('mongoose')
const category = require('./category')

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    stock: {
        type: Boolean,

    }
})
const Product = mongoose.model('Product', productSchema)
module.exports = Product

