const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Import Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles'); // NEW
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments'); // NEW
// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes); // NEW
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes); // NEW

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'CarWaah API is running smoothly' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CarWaah Server running on port ${PORT}`);
});