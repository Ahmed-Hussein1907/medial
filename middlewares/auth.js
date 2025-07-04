const jwt = require('jsonwebtoken');
const secretKey = "secret-medial-key";

// التحقق من التوكن
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '❌ No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: '❌ Invalid token' });
    }
};

// السماح بأدوار معينة
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: '⛔ Access denied' });
        }
        next();
    };
};
