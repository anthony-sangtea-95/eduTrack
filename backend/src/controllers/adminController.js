import User from "../models/User.js";
import Subject from "../models/Subject.js";

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
