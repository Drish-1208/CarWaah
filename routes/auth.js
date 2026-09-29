const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// SIGNUP ENDPOINT
router.post('/signup', async (req, res) => {
    const { email, password, full_name, phone_number, role } = req.body;
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        const { error: dbError } = await supabase.from('users').insert([{
            id: authData.user.id,
            full_name,
            phone_number,
            role: role || 'both'
        }]);
        if (dbError) throw dbError;

        res.status(201).json({ message: 'User created successfully', user: authData.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        res.status(200).json({ 
            message: 'Login successful', 
            token: data.session.access_token,
            user: data.user 
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

module.exports = router;