const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    foodItems : [
        {
            name : {
                type : String,
                required : true
            },
            foodID : {
                type : Number,
                required : true
            },
            price : {
                type : Number,
                required : true
            },
            quantity : {
                type : Number,
                required : true
            },
            image: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('Inventory', inventorySchema);