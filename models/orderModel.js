const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({

    userId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, address: {

        fullName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        pincode: { type: Number, required: true },
        houseAddress: { type: String, required: true },
        landMark: { type: String },
        cityName: { type: String, required: true },
        state: { type: String }
    }, date: {
        type: Date,
        default: new Date()
    },
    paymentMethod: { type: String },
    orderStatus: { type: String },
    items: { type: Array },
    totalAmount: { type: Number },
    discount: { type: Number }
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema)