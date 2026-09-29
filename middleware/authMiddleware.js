// middleware/authMiddleware.js
const supabase = require('../config/supabase');

const authenticateUser = async (req, res, next) => {
    try {
        // Get the token from the header (format: "Bearer <token>")
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Attach user info to the request so the next route can use it
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server authentication error' });
    }
};

module.exports = authenticateUser;