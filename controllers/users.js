const User = require('../models/user');

exports.getAllUsers = async (req, res, next) => {

    try {    
    
        const allUsers = await User.find().sort({username : 1});

        if(allUsers.length === 0) {

            return res.status(404).json('Aucun utilisateur trouvé');

        } else {

            return res.status(200).json(allUsers);

        } 
    } catch (error) {

        return res.status(500).json('Erreur lors de la récupération des utilisateurs');

    }
}

exports.getUserByEmail = async (req, res, next) => {

    const email = req.params.email;

    try {

        const user = await User.findOne({email});

        if(!user) {

            return res.status(404).json("Aucun utilisateur n'est associé à cet email");

        } 

            return res.status(200).json(user);

    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.createUser = async (req, res, next) => {

    const {username, email, password} = req.body;

    if(username === undefined || email === undefined || password === undefined) {

        return res.status(400).json('Tous les champs sont requis');

    }

    if(username.trim() === '' || email.trim() === '' || password.trim() === '') {

        return res.status(400).json('Aucun champ ne peut être vide');

    }

    if(username.length < 3 || username.length > 20) {

        return res.status(400).json("Le nom d'utilisateur doit faire entre 3 et 20 caractères");

    }

    if(password.length < 8) {

        return res.status(400).json('Le mot de passe ne peut pas faire moins de 8 caractères');

    }

    try {

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

        console.log('', error);
        return res.status(500).json({message : 'erreur', error : error.message});
        
    }
}

exports.updateUser = async (req, res, next) => {

    const {username, email, password} = req.body;

    try {

        const userToUpdate = await User.findOne({email});

        if(!userToUpdate) {

            return res.status(404).json('Aucun utilisateur associé à cet email trouvé');

        } else {

            if(userToUpdate.username.length < 3 || userToUpdate.username.length > 20)  {

                return res.status(400).json("Le nom d'utilisateur doit faire entre 3 et 20 caractères");

            }

            if(userToUpdate.password.length < 8) {

                return res.status(400).json("Le mot de passe doit faire au moins 8 caractères");

            }

            if (username && username !== userToUpdate.username) {

                const usernameTaken = await User.findOne({username});

                if(usernameTaken) {

                    return res.status(409).json("Ce nom d'utilisateur est déjà utilisé");
                    
                }

            }

            if (userToUpdate.email !== email) {

                return res.status(400).json("L'email associé à un compte ne peut être changé");

            }

            userToUpdate.username = username;
            userToUpdate.password = password;

            const updatedUser = await userToUpdate.save();

            return res.status(200).json(updatedUser);

        }
    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.deleteUser = async (req, res, next) => {

    const email = req.params.email;

    try {

        const deleteUser = await User.findOne({email});

        if(!deleteUser) {

            return res.status(404).json('Aucun utilisateur avec cet email trouvé');

        }

        await deleteUser.deleteOne();

        return res.status(204).json('Utilisateur supprimé');

    } catch (error) {

        return res.status(500).json('Erreur lors de la tentative de suppression');
    }
}