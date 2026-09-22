
/**
 * @fileoverview Users controller
 * @module controllers/users
 */

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.authenticate = async (req, res, next) => {

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

        res.header('Authorization', 'Bearer ' + token);
        return res.status(200).json({
            message : 'Bienvenue',
            token : token, 
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

/**
 * GET ALL USERS<br><br>
 * 
 * Sort users alphabetically <br><br>
 * 
 * - Check if returned array is empty (404)
 * 
 * @async
 * @function getAllUsers
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Array} 200 : Users list
 * @returns {Error} 404 | 500
 */

exports.getAllUsers = async (req, res, next) => {

    try {    

        /** Sorts users alphabetically  */
        const allUsers = await User.find().sort({username : 1}); 

        if(allUsers.length === 0) {

            /** Prevents returning an empty array if no existing user */
            return res.status(404).json('Aucun utilisateur trouvé'); 

        } else {

            return res.status(200).json(allUsers);

        } 
    } catch (error) {

        return res.status(500).json('Erreur lors de la récupération des utilisateurs');

    }
}

/**
 * GET ONE USER <br><br>
 * 
 * Use user email <br><br>
 * 
 * - Check if user exists (404)
 * 
 * @async
 * @function getUserByEmail
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Object} 200 : All user's infos
 * @returns {Error} 404 | 500
 */

exports.getUserByEmail = async (req, res, next) => {

    const email = req.params.email;

    try {

        const user = await User.findOne({email});

        if(!user) {

            return res.status(404).json("Aucun utilisateur n'est associé à cet email");

        } 

            return res.status(200).json(user);

    } catch (error) {

        return res.status(500).json('Erreur lors de la récupération de cet utilisateur');

    }
}

/**
 * CREATE ONE USER <br><br>
 * 
 * - Check if required fields are here (username / email / password) (400) <br>
 * - Check if email field isn't empty by trimming (400) <br>
 * - Check if username length is greater than 3 and lesser than 20 characters (400) <br>
 * - Check if password length is greater than 8 characters (400) <br>
 * - Check if username is already taken (409) <br>
 * - Check if email is already taken (409)
 * 
 * @async
 * @function createUser
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Object} 201 : Created user
 * @returns {Error} 400 | 409 | 500
 */

exports.createUser = async (req, res, next) => {

    const {username, email, password} = req.body;

    try {

        if(username === undefined || email === undefined || password === undefined) { /** checking for every needed field */

        return res.status(400).json('Tous les champs sont requis'); 

        }

        if(email.trim() === '') { /** trimming email to ensure a non empty field is being sent */

        return res.status(400).json('Le champ email est vide'); 

        }

        if(username.length < 3 || username.length > 20) {

        return res.status(400).json("Le nom d'utilisateur doit faire entre 3 et 20 caractères"); 

        }

        if(password.length < 8) {

        return res.status(400).json('Le mot de passe ne peut pas faire moins de 8 caractères');

        }

        const usernameTaken = await User.findOne({username});

        if(usernameTaken) {

            return res.status(409).json("Ce nom d'utilisateur est déjà utilisé");
            
        }

        const emailTaken = await User.findOne({email});

        if(emailTaken) {

            return res.status(409).json("Cet email est déjà utilisé");

        }

        const newUser = new User ({
            username,
            email,
            password
        });

        await newUser.save();

        return res.status(201).json(newUser);

    } catch (error) {

        return res.status(500).json("Erreur serveur lors de la création de l'utilisateur");
        
    }
}

/**
 * UPDATE USER <br><br>
 * 
 * Get user by email <br><br>
 * 
 * - Check if user to modify exists (404) <br>
 * - Check if sent password from frontend is correct (401) <br>
 * - Check if username is between 3 and 20 characters (400) <br>
 * - Check if password is at least 8 characters (400) <br>
 * - Check if username is already taken (409) <br>
 * - Check if email is being modified (400)
 * 
 * @async
 * @function updatedUser
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Object} 201 : Updated user
 * @returns {Error} 400 | 404 | 409 | 500
 */

exports.updateUser = async (req, res, next) => {

    const {username, email, password, currentPassword} = req.body;

    try {

        const userToUpdate = await User.findOne({email : req.params.email});

        if(!userToUpdate) {

            return res.status(404).json('Aucun utilisateur associé à cet email trouvé');

        } else {

            const correctPassword = await bcrypt.compare(currentPassword, userToUpdate.password);

            if(!correctPassword) {

                return res.status(401).json('Mot de passe incorrect, action refusée');

            }

            if(username && (username.length < 3 || username.length > 20)) {

                return res.status(400).json("Le nom d'utilisateur doit faire entre 3 et 20 caractères");


            }

            if(password && password.length < 8) {

                return res.status(400).json("Le mot de passe doit faire au moins 8 caractères");

            }

            if (username && username !== userToUpdate.username) { 

                const usernameTaken = await User.findOne({username});

                if(usernameTaken) {

                    return res.status(409).json("Ce nom d'utilisateur est déjà utilisé");
                    
                }

                /* Mandatory lines, otherwise Mongoose refuses to update the username for some reason */
                userToUpdate.username = username;
                userToUpdate.markModified('username');
            }

            if(password){

                /* Mandatory lines, otherwise Mongoose refuses to update the password for some reason */
                userToUpdate.password = password;
                userToUpdate.markModified('password');

            }

            const updatedUser = await userToUpdate.save();

            return res.status(200).json(updatedUser);

        }
    } catch (error) {

        return res.status(500).json("Erreur interne lors de la mise à jour de l'utilisateur");

    }
}

/**
 * DELETE USER <br><br>
 * 
 * - Check if user to delete exists (404) <br>
 * 
 * @async
 * @function deleteUser
 * @param {Request} req Express request
 * @param {Response} res Express response
 * @param {NextFunction} next Callback to next function
 * 
 * @returns {Response} 200 : Successful deletion message
 * @returns {Error} 404 | 500
 */

exports.deleteUser = async (req, res, next) => {

    const email = req.params.email;

    try {

        const deleteUser = await User.findOne({email});

        if(!deleteUser) {

            return res.status(404).json('Aucun utilisateur avec cet email trouvé');

        }

        await deleteUser.deleteOne();

        return res.status(200).json('Utilisateur supprimé'); /** 204 returns an empty object, 200 allows a message */

    } catch (error) {

        return res.status(500).json('Erreur lors de la tentative de suppression');
    }
}