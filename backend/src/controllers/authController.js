import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password, role });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });

         // role is required from frontend
        if (!role) {
            return res.status(400).json({ message: "Role is required" });
        }

        // role mismatch: stop login
        if (user.role !== role) {
            return res.status(403).json({ message: `You are not allowed to login as ${user.role}` });
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
