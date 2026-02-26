const express = require('express');
const router = express.Router();

const Catway = require('../models/Catway');

// id = catwayNumber
function getCatwayNumber(req) {
    const n = parseInt(req.params.id, 10);
    return Number.isNaN(n) ? null : n;
}

// GET /catways
// Liste catways
router.get('/', async (req, res) => {
    try {
        const catways = await Catway.find().sort({ catwayNumber: 1 });
        res.status(200).json(catways);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// GET /catways/:id
// Récupère un catway par son catwayNumber
router.get('/:id', async (req, res) =>  {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "Paramètre 'id' invalide (doit être un nombre"});
    }
    try {
        const catway = await Catway.findOne({ catwayNumber });
        if(!catway) {
            return res.status(404).json ({ message: 'Catway introuvable' });
        }
        res.status(200).json(catway);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// POST /catways /Crée un catways /Body attendu
router.post('/', async (req, res) => {
    const { catwayNumber, catwayType, catwayState } = req.body;

    if (catwayNumber === undefined || !catwayType || !catwayState) {
        return res.status(400).json({
            message: "Champs requis : catwayNumber, catwayType, catwayState",
        });
    }
    try {
        const created = await Catway.create({ catwayNumber, catwayType, catwayState });
        res.status(201).json(created);
    } catch(error) {
    
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'catwayNumber deja existant' });
        }
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});
//PUT /catways/:id
router.put('/:id', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
        return res.status(400).json({ message: "paramètre 'id' invalide (doit être un nombre" });
    }

    const { catwayState } = req.body;
    if (!catwayState) {
        return res.status(400).json({ message: "Champ requis : catwayState" });
    }

    try {
        const updated = await Catway.findOneAndUpdate(
            { catwayNumber },
            { catwayState },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Catway introuvable' });
        }
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

//DELETE /catways/:id
//Supprimer un catway
router.delete('/:id', async (req, res) => {
    const catwayNumber = getCatwayNumber(req);
    if (catwayNumber === null) {
    return res.status(400).json({ message: "Paramètre 'id' invalide (doit être un nombre)" });
    }

    try {
        const deleted = await Catway.findOneAndDelete({ catwayNumber });
        if (!deleted) {
            return res.status(404).json({ message: 'Catway introuvable' });
        }

        res.status(200).json({ message: 'Catway supprimé', deleted });
    } catch(error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;