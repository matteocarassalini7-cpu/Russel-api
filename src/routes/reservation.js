const express = require('express');
const router = express.Router({ mergeParams: true });

const Reservation = require('../models/Reservation');

function getCatwayNumber(req) {
    const n = parseInt(req.params.id, 10);
    return Number.isNaN(n) ? null : n;
}

// GET / reservations
router.get('/', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "paramètre 'id' invalide (doit être un nombre)" });
    }
    try {
        const reservations = await Reservation.find({ catwayNumber });
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json ({ mesage: 'Erreur serveur', error });
    }
});

//GET /catways/:id/reservations/:idReservation
router.get('/:idReservation', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "paramètre 'id' invalide (doit être un nombre)" });
    }
    try {
        const reservation = await Reservation.findOne ({
            _id: req.params.idReservation,
            catwayNumber 
        });
        
        if(!reservation) {
            return res.status(404).json({ message: 'Reservation introuvable' });
        }
         res.status(200).json(reservation);
    } catch (error) {
        return res.status(500).json({ message: 'Erreur serveur', error });
    }
});

//POST /catways/:id/reservations
router.post('/', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "paramètre 'id' invalide (doit être un nombre)" });
    }
    const { clientName, boatName, startDate, endDate } = req.body;
    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).json({ message: 'Champs requis : clientName, boatName, startDate, endDate'});
    }
    try {
        const created = await Reservation.create({
            catwayNumber,
            clientName,
            boatName,
            startDate,
            endDate
        });

        res.status(201).json(created);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// PUT /catways/:id/reservations/:idReservation
router.put('/:idReservation', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400). json({ message: "paramètre 'id' invalide  ( doit être un nombre )" });
    }

    const { clientName, boatName, startDate, endDate } = req.body;
    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).json({ message: 'Champs requis : clientName, boatName, startDate, endDate'});
    }

    try {
        const updated = await Reservation.findOneAndUpdate(
            { _id: req.params.idReservation, catwayNumber },
            { clientName, boatName, startDate, endDate },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Reservation introuvable' });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Errrur serveur', error });
    }
});

//DELETE /catways/:id/reservations/:idReservation
router.delete('/:idReservation', async (req,res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "paramètre 'id' invalide ( doit être un nomdre )"});
    }

    try {
        const deleted = await Reservation.findOneAndDelete({
            _id: req.params.idReservation,
            catwayNumber
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Reservation introuvable' });
        }
        res.status(200).json({ message: 'Reservation supprimée', deleted });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error});
    }
});

module.exports = router;