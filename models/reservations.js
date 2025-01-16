const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    foodID : {
        type : Number,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    duration : {
        type : Number,
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    },
    image : {
        type : String,
        required : true
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);