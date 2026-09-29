// routes/bookings.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateUser = require('../middleware/authMiddleware');

// 1. CREATE A NEW BOOKING (Requires Login)
router.post('/', authenticateUser, async (req, res) => {
    const { vehicle_id, start_date, end_date, total_price } = req.body;
    const renter_id = req.user.id;

    try {
        // First, check if the car is already booked for these dates
        // Overlap logic: existing_start <= requested_end AND existing_end >= requested_start
        const { data: existingBookings, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .eq('vehicle_id', vehicle_id)
            .in('status', ['pending', 'confirmed', 'active'])
            .lte('start_date', end_date)
            .gte('end_date', start_date);

        if (checkError) throw checkError;

        if (existingBookings.length > 0) {
            return res.status(409).json({ message: 'Car is already booked for these dates' });
        }

        // If dates are free, create the booking
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                vehicle_id,
                renter_id,
                start_date,
                end_date,
                total_price
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Booking created successfully', booking: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. GET ALL BOOKINGS FOR LOGGED-IN USER (Requires Login)
router.get('/my-bookings', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                vehicles ( make, model, year, images )
            `)
            .eq('renter_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ bookings: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 3. GET BOOKED DATES FOR A SPECIFIC CAR (Public - for the frontend calendar)
router.get('/vehicle/:vehicle_id/dates', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('start_date, end_date')
            .eq('vehicle_id', req.params.vehicle_id)
            .in('status', ['pending', 'confirmed', 'active']);

        if (error) throw error;
        res.status(200).json({ booked_dates: data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;