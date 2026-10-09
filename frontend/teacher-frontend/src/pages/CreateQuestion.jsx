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
    mark: "",
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
      await API.post("/teacher/questions", { ...form, mark: Number(form.mark) });
      showSuccess("Question created successfully");

      setForm({
        subject: "",
        questionText: "",
        options: { a: "", b: "", c: "", d: "" },
        correctOption: "",
        mark: "",
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
      <div className="question-container question-editor-page">
        <button className="question-back" type="button" onClick={() => navigate("/questions")}>
          ← Question bank
        </button>
        <div className="create-question-card">
          <div className="question-editor-heading">
            <p className="page-eyebrow">Question bank</p>
            <h1>Create a question</h1>
            <p>Write a clear prompt, add four answer choices, and mark the correct one.</p>
          </div>
          <form className="question-form" onSubmit={handleSubmit}>
            <div className="question-primary-fields">
              <div className="question-field">
                <label htmlFor="question-subject">Subject</label>
                <select id="question-subject" value={form.subject} onChange={handleSubjectChange} required>
                  <option value="">Select a subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>
              </div>
              <div className="question-field question-mark-field">
                <label htmlFor="question-mark">Marks</label>
                <input id="question-mark" type="number" name="mark" placeholder="e.g. 1" value={form.mark} onChange={handleChange} min="1" required />
              </div>
            </div>

            <div className="question-field">
              <label htmlFor="question-text">Question</label>
              <textarea id="question-text" name="questionText" placeholder="Enter the question prompt" value={form.questionText} onChange={handleChange} required />
            </div>

            <fieldset className="question-options-fieldset">
              <legend>Answer choices</legend>
              <p className="question-field-hint">Choose the correct answer below.</p>
              <div className="question-option-inputs">
                {["a", "b", "c", "d"].map((key) => (
                  <label key={key} className={`question-option-input ${form.correctOption === key ? "is-correct" : ""}`}>
                    <span className="question-option-letter">{key.toUpperCase()}</span>
                    <input type="text" aria-label={`Option ${key.toUpperCase()}`} placeholder={`Write option ${key.toUpperCase()}`} value={form.options[key]} onChange={(e) => handleOptionChange(key, e.target.value)} required />
                  </label>
                ))}
              </div>
              <div className="correct-options" role="group" aria-label="Select the correct answer">
                {["a", "b", "c", "d"].map((key) => (
                  <label key={key} className={form.correctOption === key ? "selected" : ""}>
                    <input type="radio" name="correctOption" value={key} checked={form.correctOption === key} onChange={handleChange} required />
                    Correct: {key.toUpperCase()}
                  </label>
                ))}
              </div>
            </fieldset>

            <section className="question-teacher-access">
              <div>
                <h2>Share with teachers <span>Optional</span></h2>
                <p>Choose colleagues who can use this question.</p>
              </div>
              <div className="teachers-list">
                {teachers.length ? teachers.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    className={`teacher-item ${form.allowedTeachers.includes(t._id) ? "selected" : ""}`}
                    onClick={() => toggleTeacher(t._id)}
                    aria-pressed={form.allowedTeachers.includes(t._id)}
                  >
                    {t.name}
                  </button>
                )) : <p className="question-list-empty">No other teachers available.</p>}
              </div>
            </section>

            <button className="question-submit-button" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Question"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
