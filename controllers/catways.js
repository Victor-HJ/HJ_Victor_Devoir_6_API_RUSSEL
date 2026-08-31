const Catway = require('../models/catway');

exports.getAllCatways = async (req, res, next) => {

    try{
        
        const allCatways = await Catway.find();

        allCatways.sort((a, b) => b.catwayNumber - a.catwayNumber);

        if(allCatways) {
            
            return res.status(200).json(allCatways);

        }

        return res.status(404).json('Aucun catway trouvé');

    } catch (error) {

        return res.status(500).json('Erreur serveur lors de la récupération des catways');
        
    }
}

exports.getCatwayById = async (req, res, next) => {

    const id = req.params.id

    try {

        let catway = await Catway.findOne({catwayNumber : parseInt(id)});

        if(catway) {

            return res.status(200).json(catway);
        }

        return res.status(404).json('Aucun catway avec ce numéro trouvé');

    } catch (error) {

        return res.status(500).json('Erreur serveur lors de la récupération de ce catway');

    }
}

exports.createCatway = async (req, res, next) => {

    const {catwayNumber, catwayType, catwayState} = req.body;

    if (catwayNumber === undefined || catwayType === undefined || catwayState === undefined) {

        return res.status(400).json('Tous les champs sont requis');
    }

    if(catwayNumber.trim() === '' || catwayType.trim() === '' || catwayState.trim() === '') {

        return res.status(400).json('Aucun champ ne peut être vide');

    }

    if (catwayType !== 'short' && catwayType !== 'long') {

        return res.status(400).json('Un catway ne peut être que de type "long" ou "short"');

    } 
  
    try {

        const preExistingCatway = await Catway.findOne({catwayNumber});

        if(preExistingCatway) {

            return res.status(409).json('Un catway est déjà associé à ce numéro')

        } else {

            const newCatway = new Catway({
                catwayNumber,
                catwayType,
                catwayState
            });

            await newCatway.save();

            return res.status(201).json(newCatway);
        }

    } catch(error) {

        return res.status(500).json('Erreur serveur lors de la création du catway');

    }
}

exports.updateCatway = async (req, res, next) => {

    const {catwayState, catwayNumber, catwayType} = req.body;
    const id = req.params.id

    if(catwayState === undefined || catwayState.trim() === '') {

        return res.status(400).json("L'état du catway doit être renseigné et celui-ci ne peut être vide");

    }

    try {

        const catwayToUpdate = await Catway.findOne({catwayNumber : parseInt(id)});

        if(!catwayToUpdate) {

            return res.status(404).json('Catway non trouvé');

        } else {

            if (catwayToUpdate.catwayNumber !== parseInt(catwayNumber) || catwayToUpdate.catwayType !==catwayType) {
                return res.status(400).json("Seul l'état du catway peut être modifié")

            } else {

                catwayToUpdate.catwayState = catwayState;

                const updatedCatway = await catwayToUpdate.save();

                return res.status(200).json(updatedCatway);
            }
        }

    } catch (error) {

        return res.status(500).json('Erreur serveur lors de la modification du catway');

    }
}

exports.deleteCatway = async (req, res, next) => {

    const id = req.params.id;

    try {

        const catwayToDelete = await Catway.findOne({catwayNumber : parseInt(id)});

        if(!catwayToDelete) {

            return res.status(404).json("Le catway que vous voulez supprimer n'a pas été trouvé");

        } else {

            await catwayToDelete.deleteOne();

            return res.status(204).json('Le catway a été supprimé');

        }

    } catch(error) {

        return res.status(500).json({error : error.message});

    }
}