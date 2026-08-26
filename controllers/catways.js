const Catway = require('../models/catway');

exports.getAll = async (req, res, next) => {

    try{
        
        const allCatways = await Catway.find();

        allCatways.sort((a, b) => b.catwayNumber - a.catwayNumber);

        if(allCatways) {
            
            return res.status(200).json(allCatways);
        }

        return res.status(404).json('Aucun catway trouvé');

    } catch (error) {

        return res.status(501).json('Erreur serveur lors de la récupération des catways');
    }
}

exports.getById = async (req, res, next) => {

    const id = req.params.id

    try {

        let catway = await Catway.findOne({catwayNumber : parseInt(id)});

        if(catway) {

            return res.status(200).json(catway);
        }

        return res.status(404).json('Aucun catway avec ce numéro trouvé');

    } catch (error) {

        return res.status(501).json('Erreur serveur lors de la récupération de ce catway');

    }
}

exports.create = async (req, res, next) => {

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

        return res.status(501).json('Erreur serveur lors de la création du catway');

    }
}

