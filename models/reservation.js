const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @typedef {Object} ReservationSchema
 * @property {number} catwayNumber - The catway associated to the booking 
 * @property {string} clientName - The name of the client booking the catway
 * @property {string} boatName - The name of the moored boat
 * @property {date} startDate - The starting date of the booking
 * @property {date} endDate - The ending date of the booking
 * @property {date} createdAt - Date of creation
 * @property {date} updatedAt - Date of update
 */

const Reservation = new Schema ({
    catwayNumber : {
        type : Number, 
        immutable : true,
        required : [true, 'Un catway doit être associé à la réservation'],
        ref : 'Catway'
    },

    clientName : {
        type : String,
        trim : true, 
        required : [true, 'Un nom doit être associé à la réservation'],
        minlength : [3, 'Le nom ne peut faire moins de 3 caractères']
    },

    boatName : {
        type: String, 
        trim : true,
        required : [true, 'Un nom de navire doit être associé à la réservation'],
        minlenght : [3, 'Le nom du navire doit faire au moins 3 caractères']
    },

    startDate : {
        type : Date,
        required : [true, 'Une date de début de réservation est requise']
    },

    endDate : {
        type : Date,
        required : [true, 'Une date de fin de réservation est requise'],
    }

}, {
    timestamps : true
})

module.exports = mongoose.model('Reservation', Reservation);