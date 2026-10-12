import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
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
            token: generateToken(user),
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

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // role mismatch: stop login
        if (user.role !== role) {
            return res.status(403).json({ message: `You are not allowed to login as ${user.role}` });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const passwordResetMessage =
    "If an account matches that email and role, a password reset link will be sent.";
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPasswordResetEmailConfig = (role) => {
    const mode = process.env.PASSWORD_RESET_EMAIL_MODE || "resend";
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.PASSWORD_RESET_FROM;
    const frontendUrl = process.env[`${role.toUpperCase()}_FRONTEND_URL`];

    if (mode !== "resend" && mode !== "console") {
        throw new Error("PASSWORD_RESET_EMAIL_MODE must be resend or console");
    }
    if (mode === "console" && process.env.NODE_ENV !== "development") {
        throw new Error("Console password reset email mode is only allowed in development");
    }
    if (!frontendUrl || (mode === "resend" && (!apiKey || !from))) {
        throw new Error("Password reset email configuration is incomplete");
    }

    const parsedFrontendUrl = new URL(frontendUrl);
    if (!["http:", "https:"].includes(parsedFrontendUrl.protocol)) {
        throw new Error("Password reset frontend URL must use HTTP or HTTPS");
    }

    parsedFrontendUrl.search = "";
    parsedFrontendUrl.hash = "";
    const resetUrl = new URL("/reset-password", parsedFrontendUrl);
    return { mode, apiKey, from, resetUrl };
};

const sendPasswordResetEmail = async ({ email, role, token, config }) => {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    config.resetUrl.searchParams.set("token", token);

    if (config.mode === "console") {
        console.info(
            `\n[DEV PASSWORD RESET]\nRole: ${role}\nReset link (expires in 15 minutes): ${config.resetUrl.href}\n`
        );
        return;
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: config.from,
            to: [email],
            subject: "Reset your eduTrack password",
            text: `A password reset was requested for your ${roleName} account. Open this link within 15 minutes to choose a new password: ${config.resetUrl.href}\n\nIf you did not request this, you can ignore this email.`,
            html: `<p>A password reset was requested for your eduTrack ${roleName} account.</p><p><a href="${config.resetUrl.href}">Reset your password</a></p><p>This link expires in 15 minutes. If you did not request this, you can ignore this email.</p>`,
        }),
    });

    if (!response.ok) {
        throw new Error(`Password reset email provider returned status ${response.status}`);
    }
};

export const requestPasswordReset = async (req, res) => {
    const { email, role } = req.body || {};
    const allowedRoles = ["admin", "teacher", "student"];
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (
        normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        !allowedRoles.includes(role)
    ) {
        return res.status(400).json({ message: "A valid email and role are required" });
    }

    let emailConfig;
    try {
        emailConfig = getPasswordResetEmailConfig(role);
    } catch (error) {
        console.error("Password reset email configuration error:", error.message);
        return res.status(503).json({ message: "Password reset email service is unavailable" });
    }

    try {
        const user = await User.findOne({
            email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
            role,
        });

        if (!user) {
            return res.json({ message: passwordResetMessage });
        }

        const token = randomBytes(32).toString("hex");
        user.passwordResetToken = createHash("sha256").update(token).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendPasswordResetEmail({ email: user.email, role, token, config: emailConfig });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            console.error("Password reset email delivery failed:", error.message);
            return res.status(503).json({ message: "Unable to send a password reset email right now" });
        }

        return res.json({ message: passwordResetMessage });
    } catch (error) {
        console.error("Password reset request failed:", error.message);
        return res.status(500).json({ message: "Unable to process the password reset request" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password, role } = req.body || {};
    const allowedRoles = ["admin", "teacher", "student"];

    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/i.test(token) ||
        typeof password !== "string" ||
        !allowedRoles.includes(role)
    ) {
        return res.status(400).json({ message: "A valid token, password, and role are required" });
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ message: "Password must be 8 to 72 bytes long" });
    }

    try {
        const hashedToken = createHash("sha256").update(token).digest("hex");
        const tokenFilter = {
            passwordResetToken: hashedToken,
            role,
        };
        const user = await User.findOne({
            ...tokenFilter,
            passwordResetExpires: { $gt: new Date() },
        }).select("_id");

        if (!user) {
            return res.status(400).json({ message: "This password reset link is invalid or expired" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.updateOne(
            {
                _id: user._id,
                ...tokenFilter,
                passwordResetExpires: { $gt: new Date() },
            },
            {
                $set: { password: hashedPassword },
                $inc: { tokenVersion: 1 },
                $unset: { passwordResetToken: "", passwordResetExpires: "" },
            }
        );

        if (result.matchedCount !== 1) {
            return res.status(400).json({ message: "This password reset link is invalid or expired" });
        }

        return res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Password reset failed:", error.message);
        return res.status(500).json({ message: "Unable to reset the password right now" });
    }
};
