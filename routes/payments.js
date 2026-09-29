// routes/payments.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const authenticateUser = require('../middleware/authMiddleware');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 1. CREATE RAZORPAY ORDER (Requires Login)
router.post('/create-order', authenticateUser, async (req, res) => {
    const { booking_id } = req.body;

    try {
        // Fetch the booking to get the exact amount (prevents users from spoofing the price)
        const { data: booking, error: dbError } = await supabase
            .from('bookings')
            .select('total_price, status')
            .eq('id', booking_id)
            .single();

        if (dbError || !booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'pending') return res.status(400).json({ message: 'Booking is not in pending status' });

        // Razorpay accepts amounts in the smallest currency unit (paise for INR)
        const amountInPaise = Math.round(booking.total_price * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: booking_id // Links the Razorpay order to our database booking ID
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ order_id: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. VERIFY PAYMENT (Requires Login)
router.post('/verify', authenticateUser, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    try {
        // Create the expected signature using our secret key
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare signatures securely
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is legit! Update the booking status in Supabase
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ 
                    status: 'confirmed',
                    payment_id: razorpay_payment_id
                })
                .eq('id', booking_id);

            if (updateError) throw updateError;

            res.status(200).json({ message: 'Payment verified successfully and booking confirmed!' });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;