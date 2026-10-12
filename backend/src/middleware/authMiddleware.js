import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user || (decoded.tokenVersion ?? 0) !== req.user.tokenVersion) {
                return res.status(401).json({ message: "Not authorized, token expired" });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token)
        return res.status(401).json({ message: "No token, authorization denied" });
};
