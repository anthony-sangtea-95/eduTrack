import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function CreateQuestion() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState({
    a: "",
    b: "",
    c: "",
    d: "",
  });
  const [correctOption, setCorrectOption] = useState("a");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!questionText || !options.a || !options.b || !options.c || !options.d) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      await API.post(`/teacher/tests/${testId}/questions`, {
        questionText,
        options,
        correctOption,
      });

      navigate(`/tests/${testId}/questions`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Add New Question</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label>Question</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter question"
          required
        />

        {["a", "b", "c", "d"].map((key) => (
          <div key={key}>
            <label>Option {key.toUpperCase()}</label>
            <input
              type="text"
              value={options[key]}
              onChange={(e) => handleOptionChange(key, e.target.value)}
              required
            />
          </div>
        ))}

        <label>Correct Option</label>
        <select
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value)}
        >
          <option value="a">A</option>
          <option value="b">B</option>
          <option value="c">C</option>
          <option value="d">D</option>
        </select>

        <button disabled={loading}>
          {loading ? "Saving..." : "Create Question"}
        </button>
      </form>
    </div>
  );
}
