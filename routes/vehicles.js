// routes/vehicles.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateUser = require('../middleware/authMiddleware');

// 1. LIST A NEW CAR (Requires Login)
router.post('/', authenticateUser, async (req, res) => {
    const { make, model, year, daily_rate, location_lat, location_lng, images } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                owner_id: req.user.id, // Grabbed securely from the auth token
                make,
                model,
                year,
                daily_rate,
                location_lat,
                location_lng,
                images: images || []
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Vehicle listed successfully', vehicle: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. GET ALL AVAILABLE CARS (Public)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select(`
                *,
                users ( full_name, phone_number )
            `)
            .eq('is_available', true);

        if (error) throw error;
        res.status(200).json({ vehicles: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. GET A SPECIFIC CAR BY ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select(`
                *,
                users ( full_name, phone_number )
            `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Vehicle not found' });

        res.status(200).json({ vehicle: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;