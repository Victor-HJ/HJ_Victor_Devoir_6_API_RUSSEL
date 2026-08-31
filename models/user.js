const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const User = new Schema ({
    username : {
        type : String,
        trim : true,
        unique : true,
        required : [true, "Un nom d'utilisateur est requis"],
        minlength : [3, "Le nom d'utilisateur doit faire au moins 3 caractères"],
        maxlength : [20, "Le nom d'utilisateur ne peut dépasser 20 caractères"]
    },

    email : {
        type : String, 
        trim : true,
        lowercase : true,
        immutable : true,
        unique : true,
        required : [true, 'Un email est requis pour chaque compte']
    },

    password : {
        type : String,
        trim : true,
        required : [true, 'Un mot de passe est requis'],
        minlength : [8, 'Le mot de passe doit faire au moins 8 caractères'],
    }
}, {
    timestamps : true
});

/* User.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = bcrypt.hashSync(this.password, 10);

    next();
});
 */
module.exports = mongoose.model('User', User);