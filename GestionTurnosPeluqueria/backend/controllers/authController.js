const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization") && req.header("Authorization").split(' ')[1];  // Obtener solo el token (sin el "Bearer")

    if (!token) return res.status(401).json({ message: "Acceso denegado" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Token inválido" });
    }
};

module.exports = authMiddleware;
