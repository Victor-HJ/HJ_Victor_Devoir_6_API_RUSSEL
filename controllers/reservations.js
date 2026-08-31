const Reservation = require('../models/reservation');
const Catway = require('../models/catway');

exports.getAllReservations = async (req, res, next) => {

    try {

        const reservations = await Reservation.find().sort({catwayNumber : 1});

        return res.status(200).json(reservations);
        
    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.getReservationsByCatway = async (req, res, next) => {

    const id = req.params.id

    try {

        const reservation = await Reservation.find({catwayNumber : parseInt(id)});

        return res.status(200).json(reservation);


    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.getReservationById = async (req, res, next) => {

    const {id, idReservation} = req.params;

    try {

        const reservation = await Reservation.findOne({catwayNumber : parseInt(id), _id : idReservation});

        if(!reservation) {

            return res.status(404).json("Aucune réservation correspondante n'a été trouvée");

        } else {

            return res.status(200).json(reservation);

        }

    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.createReservation = async (req, res, next) => {

    const {clientName, boatName, startDate, endDate} = req.body;
    const {id} = req.params;

    if (!clientName || !boatName || !startDate || !endDate){

        return res.status(400).json('Un ou plusieurs champs sont manquants');

    }

    if (clientName.length < 3 || boatName.length < 3) {

        return res.status(400).json('Le nom du client et du navire doivent faire au moins 3 caractères');

    }

    if(endDate < startDate) {

        return res.status(400).json('La date de fin ne peut être antérieure à la date de début');

    }

    try {

        const catway = await Catway.findOne({catwayNumber : parseInt(id)});

        if(!catway) {

            return res.status(404).json("Ce catway n'existe pas");

        }

        const startingPoint = new Date(startDate);
        const endingPoint = new Date(endDate);

        const overlapping = await Reservation.find({
            catwayNumber : parseInt(id),
            startDate : {$lt : endingPoint},
            endDate : {$gt : startingPoint}
        });

        if(overlapping.length > 0){

            return res.status(409).json('Créneau déjà réservé');
        }

        const newReservation = new Reservation ({
            catwayNumber : parseInt(id),
            clientName,
            boatName,
            startDate,
            endDate
        });

        await newReservation.save();

        return res.status(201).json(newReservation);

    } catch (error) {

        return res.status(500).json({error : error.message});
    }
}

exports.updateReservation = async (req, res, next) => {

    const {startDate, endDate, clientName, boatName} = req.body;
    const {idReservation, id} = req.params;

    if(!startDate || !endDate){

        return res.status(400).json('Les nouvelles dates désirées sont requises');

    }

    if(endDate < startDate) {

        return res.status(400).json('La date de fin ne peut être antérieure à la date de début')

    }

    const updatedReservation = await Reservation.findOne({_id : idReservation});

    if(clientName !== updatedReservation.clientName || boatName !== updatedReservation.boatName) {

        return res.status(400).json('Les noms du client et du navire associés à la réservation ne peuvent être modifiés');

    }

    try {

        if(!updatedReservation) {

            return res.status(404).json("Cette réservation n'existe pas");

        } else {

            const newStartingDate = new Date(startDate);
            const newEndingDate = new Date(endDate);

            const overlapping = await Reservation.find({
                catwayNumber : parseInt(id),
                _id : {$ne : idReservation},
                startDate : {$lt : newEndingDate},
                endDate : {$gt : newStartingDate}
            })

            if(overlapping.length > 0){

                return res.status(409).json('Créneau déjà utilisé');

            }

            updatedReservation.startDate = startDate;
            updatedReservation.endDate = endDate;

            await updatedReservation.save();

            return res.status(200).json(updatedReservation);
        }

    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}

exports.deleteReservation = async (req, res, next) => {

    const {idReservation} = req.params;

    try {

        const deletedReservation = await Reservation.findOne({_id : idReservation});

        if(!deletedReservation){

            return res.status(404).json("La réservation que vous souhaitez supprimer n'existe pas");

        } else {

            await deletedReservation.deleteOne();

            return res.status(204).json('Réservation supprimée');

        }

    } catch (error) {

        return res.status(500).json({error : error.message});

    }
}