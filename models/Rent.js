const mongoose = require('mongoose');

const RentSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
        default: Date.now
    },
    returnDate: {
        type: Date,
        required: [true, 'Please add a return date']
    },
    actualReturnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    price: { //this shows the price Excluding service costs
        type: Number,
        //required: [true, 'Please specify the rental price']
    },
    servicePrice: {
        type: Number,
        default: 0,
        // This field will store the calculated total service price
    },
    additionalCharges: {
        type: Object
    },
    notes: {
        type: String
    },
    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isRated: {
        type: Boolean,
        default: false
    },
});


module.exports = mongoose.model('Rent', RentSchema);