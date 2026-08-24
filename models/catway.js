const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Catway = new Schema ({
    catwayNumber : {
        type : Number,
        trim : true,
        immutable : true,
        required : [true, 'Chaque catway doit avoir un numéro']
    },

    catwayType : {
        type : String,
        trim : true,
        immutable : true,
        enum : ['short', 'long'],
        required : [true, 'Le type du catway doit être défini']
    },

    catwayState : {
        type : String,
        trim : true,
        required : [true, 'Chaque catway doit avoir un état défini']
    }
}, {
    timestamps : true
});

module.exports = mongoose.model('Catway', Catway);