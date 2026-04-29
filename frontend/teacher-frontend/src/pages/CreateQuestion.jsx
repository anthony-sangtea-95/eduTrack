import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/CreateQuestion.css";
import { useNavigate } from "react-router-dom";
import { showSuccess,showError } from "../../../utils/utils";

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    questionText: "",
    options: { a: "", b: "", c: "", d: "" },
    correctOption: "",
    allowedTeachers: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/teacher/subjects");
      setSubjects(res.data);
    } catch {
      showError("Failed to load subjects");
    }
  };

  const fetchTeachers = async () => {
  try {
    const res = await API.get("/teacher/users");
    setTeachers(res.data);
  } catch {
    showError("Failed to load teachers");
  }
};

const toggleTeacher = (teacherId) => {
  setForm((prev) => {
    const alreadySelected = prev.allowedTeachers.includes(teacherId);

    return {
      ...prev,
      allowedTeachers: alreadySelected
        ? prev.allowedTeachers.filter((id) => id !== teacherId)
        : [...prev.allowedTeachers, teacherId],
    };
  });
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (key, value) => {
    setForm({
      ...form,
      options: { ...form.options, [key]: value },
    });
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setForm({ ...form, subject: subjectId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await API.post("/teacher/questions", form);
      showSuccess("Question created successfully");

      setForm({
        subject: "",
        questionText: "",
        options: { a: "", b: "", c: "", d: "" },
        correctOption: "",
        allowedTeachers: [],
      });
    } catch (err) {
      showError("Failed to create question");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="question-container">
        <button className="question-back" onClick={() => navigate("/questions")}>
          ← Back
        </button>
        <div className="create-question-card">
          <h2>Create Question</h2>
          <form className="question-form" onSubmit={handleSubmit}>
            {/* SUBJECT */}
            <select value={form.subject} onChange={handleSubjectChange} required>
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectName}
                </option>
              ))} 
            </select>

            {/* QUESTION TEXT */}
            <textarea
              name="questionText"
              placeholder="Enter question text"
              value={form.questionText}
              onChange={handleChange}
              required
            />

            {/* OPTIONS */}
            {["a", "b", "c", "d"].map((key) => (
              <input
                key={key}
                type="text"
                placeholder={`Option ${key.toUpperCase()}`}
                value={form.options[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                required
              />
            ))}

            {/* CORRECT OPTION */}
            <div className="correct-options">
              {["a", "b", "c", "d"].map((key) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="correctOption"
                    value={key}
                    checked={form.correctOption === key}
                    onChange={handleChange}
                    required
                  />
                  {key.toUpperCase()}
                </label>
              ))}
            </div>
          <label>Allowed Teachers:</label>
          <div className="teachers-list">
            {teachers.map((t) => (
              <div
                key={t._id}
                className={`teacher-item ${
                  form.allowedTeachers.includes(t._id) ? "selected" : ""
                }`}
                onClick={() => toggleTeacher(t._id)}
              >
                {t.name}
              </div>
            ))}
          </div>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Question"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
