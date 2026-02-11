import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import Loading from "../components/Loading";
// import "../assets/css/Question.css";
 import "../assets/css/EditQuestion.css";

export default function EditQuestion() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    questionText: "",
    options: { a: "", b: "", c: "", d: "" },
    correctOption: "",
  });

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const res = await API.get(`/teacher/questions/${questionId}`);
      const q = res.data;

      setForm({
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
      });
    } catch (err) {
      setError("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOptionChange = (key, value) => {
    setForm({
      ...form,
      options: { ...form.options, [key]: value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const {data} = await API.put(`/teacher/questions/${questionId}`, form);
      if (data.success) {
        setSuccess("Updated Success...");
      }
    } catch (err) {
      setError("Error : " + err.message);
    }
  };

  if (loading) return <Loading />;

  return (
      <>
        <div className="edit-page">
            <div className="card">
              { (error || success) && (<p className={ error ? "error" : "success"}>{ error ? error : success }</p> )}
                <h2 className="page-title">Edit Question</h2>

                <form onSubmit={handleSubmit} className="question-form">
                
                <div className="form-group">
                    <label>Question</label>
                    <textarea
                    name="questionText"
                    value={form.questionText}
                    onChange={handleChange}
                    placeholder="Enter question text..."
                    required
                    />
                </div>

                <div className="options-grid">
                    {["a", "b", "c", "d"].map((key) => (
                    <div
                        key={key}
                        className={`option-box ${
                        form.correctOption === key ? "correct" : ""
                        }`}
                    >
                        <label>Option {key.toUpperCase()}</label>
                        <input
                        value={form.options[key]}
                        onChange={(e) => handleOptionChange(key, e.target.value)}
                        required
                        />
                    </div>
                    ))}
                </div>

                <div className="form-group">
                    <label>Correct Answer</label>
                    <select
                    name="correctOption"
                    value={form.correctOption}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Select correct option</option>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn primary">
                    Update Question
                    </button>
                    <button
                    type="button"
                    className="btn ghost"
                    onClick={() => navigate("/questions")}
                    >
                    Cancel
                    </button>
                </div>

                </form>
            </div>
        </div>
      </>
  );
}
