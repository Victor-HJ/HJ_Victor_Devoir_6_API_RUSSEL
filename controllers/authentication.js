/**
 * @fileoverview Authentication controller
 * @module controllers/authentication
 */

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Log in the API, this function checks credentials
 * 
 * @async
 * @function login
 * @param {Request} Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Object} A dashboard page
 * @throws {Error} If credentials are invalid
 */

exports.login = async (req, res, next) => {

    const {email, password} = req.body;

    try {

        const user = await User.findOne({email : email});

        if (!user) {

            return res.status(404).json("L'utilisateur n'existe pas");

        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword) {

            return res.status(403).json ('Informations de connexion incorrectes');

        }

        delete user._doc.password;

        const expireIn = 24 * 60 * 60;
        const token = jwt.sign(
            {user : user},
            process.env.SECRET_KEY,
            {expiresIn : expireIn}
        );

        res.cookie('token', token, {
            sameSite : true,
            maxAge : 24 * 60 * 60
        });

        return res.status(200).json({
            user : {
                id : user._id,
                email : user.email,
                username : user.username
            }
        });

    } catch (error) {

        return res.status(500).json('Erreur lors de la tentative de connexion');

    }
}

exports.logout = async (req, res, next) => {

    res.clearCookie('token');

    return res.status(200).json('Vous vous êtes déconnecté');

}