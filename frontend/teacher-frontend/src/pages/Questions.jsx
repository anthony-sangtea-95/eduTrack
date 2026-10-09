import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useParams } from "react-router-dom";
import "../assets/css/Question.css";
import Loading from '../components/Loading.jsx'

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await API.get(`/teacher/questions`);
      setQuestions(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const { data } = await API.delete(`/teacher/questions/${id}`);
      if (data.success) {
        setSuccess("Success Delete...");
      } else {
        setError(data.message);
      }
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      setError(`Error : ${err.message}`)
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="main">
    <div className="page question-bank-page">
      {error && (
        <div className="page-feedback page-feedback-error" role="alert">
          <span>{error}</span>
          <button className="question-retry" type="button" onClick={fetchQuestions}>Try again</button>
        </div>
      )}
      {success && <p className="success">{success}</p>}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Teaching workspace</p>
          <h1>Question bank</h1>
          <p className="page-description">Create and maintain reusable questions for your assessments.</p>
        </div>
        <Link to="/questions/create" className="button">
          + New Question
        </Link>
      </div>

      {error && questions.length === 0 ? null : questions.length === 0 ? (
        <section className="question-empty-state">
          <span className="question-empty-mark" aria-hidden="true">?</span>
          <div>
            <h2>Your question bank is empty</h2>
            <p>Create your first question to start building reusable assessment content.</p>
          </div>
          <Link to="/questions/create" className="button">Create a question</Link>
        </section>
      ) : (
        <div className="question-table-card">
        <div className="question-table-caption">
          <div>
            <h2>Saved questions</h2>
            <p>{questions.length} {questions.length === 1 ? 'question' : 'questions'} in your bank</p>
          </div>
        </div>
        <div className="question-table-scroll">
        <table className="table question-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Subject</th>
              <th>Mark</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr key={q._id}>
                <td>{index + 1}</td>
                <td>{q.questionText}</td>
                <td>{q.subject?.subjectName || '—'}</td>
                <td><span className="mark-pill">{q.mark} {q.mark === 1 ? 'mark' : 'marks'}</span></td>
                <td className="actions">
                  <Link
                    to={`/teacher/questions/${q._id}/edit`}
                    className="btn-question btn-question-edit"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteQuestion(q._id)}
                    className="btn-question btn-question-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>
      )}
    </div>
    </main>
  );
}
