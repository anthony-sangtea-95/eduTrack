import { useEffect, useState } from "react";
import API from "../services/api";
import "../assets/css/CreateQuestion.css";

export default function CreateQuestion() {
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);
  const [isTestDisabled, setIsTestDisabled] = useState(true);
  const [teachers, setTeachers] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    test: "",
    questionText: "",
    options: { a: "", b: "", c: "", d: "" },
    correctOption: "",
    allowedTeachers: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/teacher/subjects");
      setSubjects(res.data);
    } catch {
      setError("Failed to load subjects");
    }
  };

  const fetchTests = async (subjectId) => {
    try {
      const res = await API.get(`/teacher/tests/${subjectId}`);
      setTests(res.data);
      setIsTestDisabled(res.data.length === 0);
    } catch {
      setError("Failed to load tests");
    }
  };

  const fetchTeachers = async () => {
  try {
    const res = await API.get("/teacher/users");
    setTeachers(res.data);
  } catch {
    setError("Failed to load teachers");
  }
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
    setForm({ ...form, subject: subjectId, test: "" });
    setTests([]);
    setIsTestDisabled(true);
    if (subjectId) {
      fetchTests(subjectId);
    }
  };

  const handleAllowedTeachersChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setForm({
      ...form,
      allowedTeachers: selected,
    });
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      await API.post("/teacher/questions", form);
      setSuccess("Question created successfully ✅");

      setForm({
        subject: "",
        test: "",
        questionText: "",
        options: { a: "", b: "", c: "", d: "" },
        correctOption: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-container">
      <h2>Create Question</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

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

        {/* TEST (optional) */}
        <select
          name="test"
          value={form.test}
          onChange={handleChange}
          disabled={isTestDisabled}
        >
          <option value="">No Test (Question Bank)</option>
          {tests.map((t) => (
            <option key={t._id} value={t._id}>
              {t.title}
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

        {/* ALLOWED TEACHERS */}
        <label>Allowed Teachers:</label>
        <select
        multiple
        value={form.allowedTeachers}
        onChange={handleAllowedTeachersChange}
        >
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Question"}
        </button>
      </form>
    </div>
  );
}
