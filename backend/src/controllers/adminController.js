import User from "../models/User.js";
import TestType from "../models/TestType.js";

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
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getTestTypes = async (req, res) => {
  try {
    const testTypes = await TestType.find().select("_id typeName");
    res.json(testTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createTestType = async (req, res) => {
  try {
    const { typeName } = req.body;
    const testType = await TestType.create({ typeName, createdBy: req.user._id });
    res.status(201).json(testType);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
