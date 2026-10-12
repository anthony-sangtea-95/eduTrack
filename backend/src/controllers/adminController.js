import User from "../models/User.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";

const validRoles = ["admin", "teacher", "student"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUserDetails = ({ name, email, role, password }, requirePassword = false) => {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return "Name is required and must be 100 characters or fewer";
  }
  if (
    typeof email !== "string" ||
    email.trim().length > 254 ||
    !emailPattern.test(email.trim())
  ) {
    return "A valid email address is required";
  }
  if (!validRoles.includes(role)) {
    return "A valid role is required";
  }
  if (
    (requirePassword || password !== undefined) &&
    (typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72)
  ) {
    return "Password must be 8 to 72 bytes long";
  }
  return null;
};

const isLastAdmin = async (user) => {
  if (user.role !== "admin") return false;
  return (await User.countDocuments({ role: "admin" })) <= 1;
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    const validationError = validateUserDetails({ name, email, password, role }, true);
    if (validationError) return res.status(400).json({ message: validationError });

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({
      email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (exists) return res.status(409).json({ message: "An account with this email already exists" });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "An account with this email already exists" });
    return res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const { name, email, password, role } = req.body || {};
    const validationError = validateUserDetails({ name, email, password, role });
    if (validationError) return res.status(400).json({ message: validationError });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.equals(req.user._id) && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own administrator role" });
    }
    if (user.role === "admin" && role !== "admin" && await isLastAdmin(user)) {
      return res.status(400).json({ message: "The last administrator cannot be demoted" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = await User.findOne({
      _id: { $ne: user._id },
      email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (emailExists) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const securityChanged = user.email.toLowerCase() !== normalizedEmail ||
      user.role !== role ||
      password !== undefined;
    user.name = name.trim();
    user.email = normalizedEmail;
    user.role = role;
    if (password !== undefined) user.password = password;
    if (securityChanged) {
      user.tokenVersion += 1;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
    }
    await user.save();

    return res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "An account with this email already exists" });
    return res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    if (await isLastAdmin(user)) {
      return res.status(400).json({ message: "The last administrator cannot be deleted" });
    }

    await User.deleteOne({ _id: user._id });
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().select("_id subjectName");
    res.json(subjects);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { subjectName } = req.body;
    const subject = await Subject.create({ subjectName, createdBy: req.user._id });
    res.status(201).json(subject);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { subjectName } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { subjectName }, { new: true });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json(subject);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json({ message: "Subject deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
