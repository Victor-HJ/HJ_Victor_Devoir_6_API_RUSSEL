const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} CatwaySchema
 * @property {number} catwayNumber - Unique and definitive number associated to the catway
 * @property {'short' | 'long'} catwayType - Type of catway (long ou short)
 * @property {string} catwayState - State of the catway
 * @property {date} createdAt - Date of creation
 * @property {date} updatedAt - Date of update
 */

const Catway = new Schema ({
    catwayNumber : {
        type : Number,
        trim : true,
        immutable : true,
        unique : true,
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